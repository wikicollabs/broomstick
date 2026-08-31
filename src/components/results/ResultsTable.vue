<!--
  Broomstick - Results Table
  A tool to identify Lexemes on Wikidata that can be improved
  
  @license GPL-2.0-or-later
  @see https://github.com/wikicollabs/broomstick
-->

<template>
  <div class="results-wrapper" :class="{ 'all-hidden': allVisitedAndHidden, 'connection-error': props.connectionError }">
    <CdxTable
      :caption="tableCaption"
      tabindex="-1"
      :columns="
        results.length === 0 ||
        (hideVisited && filteredResults.length === 0) ||
          props.connectionError
          ? []
          : columns
      "
      :data="tableData"
      :paginate="
        results.length > 0 &&
        !(hideVisited && filteredResults.length === 0) &&
        !props.connectionError
      "
      :pagination-size-options="paginationOptions"
      :pagination-size-default="200"
      v-model:sort="sortState"
      :use-row-headers="false"
    >
      <template #header>
        <ResultsVisibility
          ref="visibilityControlsRef"
          :visible="results.length > 0 && !props.connectionError"
          :hide-visited="hideVisited"
          :hidden-count="hiddenCount"
          :visibility-status-message="visibilityStatusMessage"
          @toggle="toggleHideVisited"
        />
      </template>

      <template #item-visited="{ row }">
        <CdxIcon
          v-if="isVisited(row.lexemeId)"
          :icon="cdxIconSuccess"
          size="medium"
          :style="{ color: 'var(--color-subtle)' }"
          class="visited-icon"
          data-visited="true"
          aria-hidden="true"
        />
        <CdxIcon
          v-else
          :icon="cdxIconNotBright"
          size="medium"
          :style="{ color: 'transparent' }"
          aria-hidden="true"
        />
      </template>

      <template #item-lexemeId="{ row }">
        <ResultsLink
          :lexeme-id="row.lexemeId"
          :lemma="row.lemma"
          :lexical-category="row.lexicalCategory"
          :is-visited="isVisited(row.lexemeId)"
          :text-filter="props.textFilter"
          @visit="markVisited"
        />
      </template>

      <template #item-lemma="{ row }">
        <HighlightedText :text="row.lemma" :filter="props.textFilter" />
      </template>

      <template #empty-state>
        <ResultsEmpty
          :connection-error="props.connectionError"
          :all-visited-hidden="hideVisited && filteredResults.length === 0"
          @reload="reloadPage"
        />
      </template>
    </CdxTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance, watch, nextTick, toRef } from "vue";
import { CdxTable, CdxIcon } from "@wikimedia/codex";
import { cdxIconSuccess, cdxIconNotBright } from "@wikimedia/codex-icons";
import type { LexemeResult } from "../../types/types";
import { useVisitedLexemes } from "./composables/useVisitedLexemes";
import ResultsVisibility from "./ResultsVisibility.vue";
import ResultsEmpty from "./ResultsEmpty.vue";
import ResultsLink from "./ResultsLink.vue";
import HighlightedText from "./HighlightedText.vue";

const instance = getCurrentInstance();
const $i18n = instance?.appContext.config.globalProperties.$i18n as (
  key: string,
  ...params: unknown[]
) => string;

const reloadPage = () => {
  window.location.reload();
};

interface Props {
  results: LexemeResult[];
  totalCount: number;
  textFilter?: string;
  connectionError?: boolean;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  textFilter: "",
  connectionError: false,
  isLoading: false,
});

const sortState = ref<Record<string, "asc" | "desc">>({});
const visibilityControlsRef = ref<InstanceType<typeof ResultsVisibility> | null>(null);

const {
  hideVisited,
  visibilityStatusMessage,
  hiddenCount,
  filteredResults,
  allVisitedAndHidden,
  markVisited,
  isVisited,
  toggleHideVisited,
  restoreFromStorage,
} = useVisitedLexemes(toRef(props, "results"), $i18n);

const columns = computed(() => [
  {
    id: "visited",
    label: "",
    allowSort: false,
    width: "2.75rem",
    minWidth: "2.75rem",
  },
  {
    id: "lexemeId",
    label: $i18n('table-lexeme-id-header'),
    allowSort: true,
    width: "12.5rem",
    minWidth: "12.5rem",
  },
  {
    id: "lemma",
    label: $i18n('table-lemma-header'),
    allowSort: true,
    minWidth: "12.5rem",
  },
  {
    id: "lexicalCategory",
    label: $i18n('table-category-header'),
    allowSort: true,
    minWidth: "12.5rem",
  },
]);

onMounted(() => {
  // restore from sessionStorage
  restoreFromStorage();

  // add aria-label to visited column header after table renders
  const visitedHeader = document.querySelector(".cdx-table th:first-child");
  if (visitedHeader) {
    visitedHeader.setAttribute("aria-label", $i18n('table-visited-header'));
  }

  updateHeaderAriaLabels();
  updateRowsPerPageAriaLabel();

  // watch for dropdown state changes to update aria-label
  const selectWrapper = document.querySelector('.cdx-select-vue');
  if (selectWrapper) {
    const observer = new MutationObserver(() => {
      updateRowsPerPageAriaLabel();
    });
    observer.observe(selectWrapper, { attributes: true, attributeFilter: ['class'] });
  }
});

watch(sortState, updateHeaderAriaLabels, { deep: true });

const paginationOptions = [
  { value: 10 },
  { value: 50 },
  { value: 100 },
  { value: 200 },
  { value: 500 },
  { value: 1000 },
];

const tableCaption = computed(() => {
  if (props.connectionError) return '';
  const count = props.totalCount; // use total instead of filtered
  return $i18n('table-result-count', count, count);
});

interface TableRow {
  visited: string;
  lexemeId: string;
  lemma: string;
  lexicalCategory: string;
}

const tableData = computed<TableRow[]>(() => {

  let data: TableRow[] = filteredResults.value.map((result) => ({
    visited: "",
    lexemeId: result.lexemeId,
    lemma: result.lemma,
    lexicalCategory: result.lexicalCategory,
  }));


  const sortColumn = Object.keys(sortState.value)[0] as keyof TableRow | undefined;

  if (sortColumn) {
    const sortDirection = sortState.value[sortColumn];

    data = [...data].sort((a, b) => {
      let aVal = String(a[sortColumn]).toLowerCase();
      let bVal = String(b[sortColumn]).toLowerCase();

      if (sortDirection === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
  }

  return data;
});

const lidSortAriaLabel = computed(() => {
  const sortColumn = Object.keys(sortState.value)[0];
  const sortOrder = sortColumn ? sortState.value[sortColumn] : null;

  if (sortColumn !== 'lexemeId') {
    return $i18n('table-header-lid-default');
  }
  return sortOrder === 'asc'
    ? $i18n('table-header-lid-ascending')
    : $i18n('table-header-lid-descending');
});

const lemmaSortAriaLabel = computed(() => {
  const sortColumn = Object.keys(sortState.value)[0];
  const sortOrder = sortColumn ? sortState.value[sortColumn] : null;

  if (sortColumn !== 'lemma') {
    return $i18n('table-header-lemma-default');
  }
  return sortOrder === 'asc'
    ? $i18n('table-header-lemma-ascending')
    : $i18n('table-header-lemma-descending');
});

const lexicalCategorySortAriaLabel = computed(() => {
  const sortColumn = Object.keys(sortState.value)[0];
  const sortOrder = sortColumn ? sortState.value[sortColumn] : null;

  if (sortColumn !== 'lexicalCategory') {
    return $i18n('table-header-lexcat-default');
  }
  return sortOrder === 'asc'
    ? $i18n('table-header-lexcat-ascending')
    : $i18n('table-header-lexcat-descending');
});

function focusToggle(): void {
  visibilityControlsRef.value?.focus();
}

defineExpose({ focusToggle });

function updateHeaderAriaLabels(): void {
  nextTick(() => {
    const buttons = document.querySelectorAll(".cdx-table th button");
    if (buttons[0]) buttons[0].setAttribute("aria-label", lidSortAriaLabel.value);
    if (buttons[1]) buttons[1].setAttribute("aria-label", lemmaSortAriaLabel.value);
    if (buttons[2]) buttons[2].setAttribute("aria-label", lexicalCategorySortAriaLabel.value);
  });
}

function updateRowsPerPageAriaLabel(): void {
  nextTick(() => {
    const combobox = document.querySelector('.cdx-select-vue__handle[role="combobox"]');
    if (combobox) {
      const displayedText = combobox.querySelector('span span')?.textContent;
      if (displayedText) {
        combobox.setAttribute('aria-label', displayedText);
      }
    }
  });
}

</script>

<style scoped>
.results-wrapper {
  position: relative;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scroll-padding-top: 3.375rem;
}

@media (min-width: 640px) {
  .results-wrapper {
    scroll-padding-top: 4rem;
  }
  }

/* only remove border when empty */
.results-wrapper :deep(.cdx-table__table__empty-state-content) {
  border: none !important;
  pointer-events: none !important;
  user-select: none !important;
  background-color: transparent !important;
}

.results-wrapper :deep(.cdx-table__table__empty-state-content:hover) {
  background-color: transparent !important;
}

:deep(.cdx-table__header) {
  height: 3.5rem;
  padding: var(--spacing-75) !important;
}

:deep(.cdx-table th) {
  padding: 0;
}

:deep(.cdx-table th button) {
  padding: var(--spacing-75);
}

/* disable ALL hover states when all items hidden */
.all-hidden :deep(tr:has(td:first-child .visited-icon):hover),
.all-hidden
  :deep(tr:has(td:first-child .visited-icon):hover td),
.all-hidden
  :deep(tbody tr:not(:has(td:first-child .visited-icon)):hover),
.all-hidden
  :deep(tbody tr:not(:has(td:first-child .visited-icon)):hover td) {
  background-color: var(--background-color-base) !important;
}

:deep(.cdx-table__table__empty-state-content) {
  white-space: normal !important;
  overflow-wrap: break-word !important;
  width: auto !important;
  max-width: 100% !important;
}

:deep(.cdx-table table) {
  table-layout: auto;
}

.results-wrapper.has-data :deep(.cdx-table table) {
  width: max-content;
}

.results-wrapper.all-hidden {
  overflow-x: visible;
}

.results-wrapper.all-hidden :deep(.cdx-table table) {
  width: 100%;
}

:deep(.cdx-table td),
:deep(.cdx-table th) {
  white-space: nowrap; /* prevent vertical text wrapping */
}

/* desktop: allow lemma to wrap */
@media (min-width: 640px) {
  :deep(.cdx-table table) {
    width: 100%; /* table fills container on desktop */
  }

  :deep(.cdx-table td:nth-child(3)),
  :deep(.cdx-table td:nth-child(4)) {
    /* lemma column (3rd column) */
    white-space: normal;
  }
}

/* border on visited column */
:deep(td:first-child) {
  border-right: 0.0625rem solid var(--border-color-base) !important;
}

/* visited row default state */
:deep(tr:has(td:first-child .visited-icon)) {
  background-color: var(--background-color-neutral) !important;
  color: var(--color-subtle) !important;
}

/* visited row hover state */
:deep(tr:has(td:first-child .visited-icon):hover) {
  background-color: var(--background-color-neutral-subtle) !important;
}

/* visited row hover - target td elements directly */
:deep(tr:has(td:first-child .visited-icon):hover td) {
  background-color: var(--background-color-neutral-subtle) !important;
}

/* NON-visited row hover state */
:deep(tbody tr:not(:has(td:first-child .cdx-icon[data-visited="true"])):hover) {
  background-color: var(--background-color-interactive-subtle) !important;
}

/* NON-visited row hover - target td elements */
:deep(tbody tr:not(:has(td:first-child .cdx-icon[data-visited="true"])):hover td) {
  background-color: var(--background-color-interactive-subtle) !important;
}

/* visited row links */
:deep(tr:has(td:first-child .visited-icon) a) {
  color: var(--color-visited) !important;
}

/* visited row link icons */
:deep(tr:has(td:first-child .visited-icon) a .cdx-icon) {
  color: var(--color-visited) !important;
}

/* visited row link hover underline */
:deep(tr:has(td:first-child .visited-icon) a:hover) {
  text-decoration: underline;
}

/* hide table visual structure when showing connection error */


/* hide table header when showing connection error */
.results-wrapper.connection-error :deep(.cdx-table__header) {
  display: none !important;
}

.results-wrapper.connection-error :deep(.cdx-table thead) {
  display: none !important;
}

.results-wrapper.connection-error :deep(.cdx-table) {
  border-top: none !important;
}

/* only style button in connection error state */
.results-wrapper.connection-error :deep(.empty-state button) {
  align-self: center;
  margin-top: var(--spacing-75);
  pointer-events: auto;
  position: relative;
  z-index: 1;
}
</style>
