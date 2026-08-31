<!--
  Broomstick - Main App Component
  A tool to identify Lexemes on Wikidata that can be improved
  
  @license GPL-2.0-or-later
  @see https://github.com/wikicollabs/broomstick
-->

<template>
  <div class="app">
    <CdxToastContainer />

    <AppHeader @home="store.goHome()" ref="headerRef" />

    <main class="main-content">

      <div v-if="currentView === 'landing'" class="landing-view">
        <div class="body-frame">
          <section class="section-text">
            <h1>{{ $i18n('broomstick-tagline') }}</h1>
            <p class="subtitle">{{ $i18n('broomstick-subtitle') }}</p>
          </section>
          <section class="section-form">
            <div class="landing-search-panel">
              <SearchForm
                v-model:language="selectedLanguage"
                v-model:gapType="selectedGapType"
                :disabled="isLoading"
                @search="executeSearch"
              />
            </div>
          </section>
        </div>
      </div>

      <div v-else-if="currentView === 'search'" class="search-view">
        <div class="search-content">
          <div class="header-row">
            <CdxButton
              v-show="isPanelCollapsed"
              @click="isPanelCollapsed = false"
              class="expand-button"
              :aria-label="activeFilterCount > 0 
                ? $i18n('search-show-panel-aria-with-filters',activeFilterCount)
                : $i18n('search-show-panel-aria')"
            >
              <CdxIcon :icon="cdxIconExpand" />
              {{ activeFilterCount > 0 
                  ? `${$i18n('search-show-panel')} (${activeFilterCount})`
                  : $i18n('search-show-panel') }}
            </CdxButton>
            <h1>
              <bdi>{{ searchedLanguage }}</bdi> · <bdi>{{ getQueryLabel(searchedGapType) }}</bdi>
            </h1>
          </div>

          <div class="search-layout">
            <div v-show="!isPanelCollapsed" class="results-search-panel">
              <div class="search-header">
                <h3 class="search-heading">{{ $i18n('search-heading') }}</h3>
                <CdxButton
                  @click="collapsePanel"
                  class="collapse-button"
                  :aria-label="$i18n('search-hide-panel-aria')"
                >
                  <CdxIcon :icon="cdxIconCollapse" />
                </CdxButton>
              </div>

              <SearchForm
                v-model:language="selectedLanguage"
                v-model:gapType="selectedGapType"
                :disabled="isLoading"
                :results-exist="results.length > 0"
                :active-filter-count="activeFilterCount"
                @search="executeSearch"
              />

              <div v-if="results.length > 0" class="filter-divider"></div>

              <div v-if="results.length > 0" class="filters-section">
                <div class="filters-header">
                  <h3>{{ $i18n('filters-heading') }}{{ activeFilterCount > 0 ? ` (${activeFilterCount})` : '' }}</h3>
                    <CdxButton
                      weight="quiet"
                      :disabled="!hasActiveFilters"
                      :aria-disabled="!hasActiveFilters"
                      @click="clearFilters"
                      class="clear-filters-button"
                    >
                      {{ $i18n('filters-clear-all') }}
                    </CdxButton>
                </div>
              
                <div class="filters-controls">
                  <CdxTextInput
                    v-model="textFilter"
                    ref="textInputRef"
                    input-type="search"
                    :start-icon="cdxIconSearch"
                    :clearable="true"
                    :placeholder="$i18n('filters-text-placeholder')"
                    :aria-label="$i18n('filters-text-label-aria')"
                  />
                      <cdx-field
                        :status="categoryFilterError ? 'error' : 'default'"
                      >
                        <template #label>
                          {{ $i18n('filters-category-label') }}
                        </template>
                        <cdx-combobox
                        :key="$i18n.locale"
                          v-model:selected="categoryFilter"
                          :menu-items="filteredCategoryMenuItems"
                          :placeholder="$i18n('filters-lexical-category-placeholder')"
                          @input="onCategoryInput"
                          @blur="categoryFilterBlurred = true"
                        />
                      </cdx-field>
                      <cdx-message 
                        v-if="categoryFilterError"
                        type="error"
                        inline
                        class="category-filter-error"
                        tabindex="0"
                        ref="categoryFilterErrorRef"
                      >
                        {{ categoryFilterError }}
                      </cdx-message>
                </div>
              </div>
            </div>

            <div class="results-area">
              <ResultsPanel
                ref="resultsTableRef"
                :is-loading="isLoading"
                :error="error"
                :results="filteredResults"
                :total-count="results.length"
                :text-filter="textFilter"
                :connection-error="connectionError"
              />
            </div>
          </div>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, getCurrentInstance, nextTick} from "vue";
import { CdxButton, CdxIcon, CdxMessage, CdxTextInput, CdxSelect, CdxLabel, CdxCombobox, CdxField, CdxToastContainer, useToast } from "@wikimedia/codex";
import { cdxIconCollapse, cdxIconExpand, cdxIconSearch} from "@wikimedia/codex-icons";
import AppHeader from "./components/AppHeader.vue";
import SearchForm from "./components/SearchForm.vue";
import ResultsPanel from "./components/results/ResultsPanel.vue";
import AppFooter from "./components/AppFooter.vue";
import { getQueryOptionsForLanguage } from "./data/queryOptions.js";
import { useSearchStore } from "./state/searchStore";
import { storeToRefs } from "pinia";

const instance = getCurrentInstance();
const $i18n = instance?.appContext.config.globalProperties.$i18n;

const toast = useToast();

const locale = computed(() => localStorage.getItem('locale') || 'en');

const store = useSearchStore();
const {
  currentView,
  selectedLanguage,
  selectedGapType,
  searchedLanguage,
  searchedGapType,
  isLoading,
  error,
  connectionError,
  results,
} = storeToRefs(store);

const isPanelCollapsed = ref(false);
const textFilter = ref('');
const categoryFilter = ref('');
const headerRef = ref(null);
const resultsTableRef = ref(null);
const categoryFilterBlurred = ref(false);
const categorySearchTerm = ref('');

function getQueryLabel(queryValue) {
  if (!queryValue) return '';
  
  // get the query definition to find params
  const allGroups = getQueryOptionsForLanguage(searchedLanguage.value);
  for (const group of allGroups) {
    const query = group.items.find(item => item.value === queryValue);
    if (query) {
      return query.params 
        ? $i18n(query.label, ...query.params) 
        : $i18n(query.label);
    }
  }
  
  // fallback
  return $i18n(`queries-${queryValue}`);
}

// call restore on mount
onMounted(() => {
  store.restoreLastSearch(); // restore from localStorage first
  store.restoreFromUrl(); // then check url params and override if present

  window.addEventListener('popstate', store.handlePopState);

  // check for language change toast
  const toastLang = localStorage.getItem('language_change_toast');
    if (toastLang) {
      toast.show({
        message: $i18n('settings-language-changed', toastLang),
        type: 'success',
        preventUserDismiss: true,
        autoDismiss: true,
      });
      localStorage.removeItem('language_change_toast');
    }

  if (!categoryFilter.value) {
    categoryFilter.value = $i18n('filters-category-all');
  }
});

// watch for display language changes and update the "all" filter value
watch(() => $i18n('filters-category-all'), (newAllLabel, oldAllLabel) => {
  // if the filter was set to the old "all" label, update it to the new one
  if (categoryFilter.value === oldAllLabel) {
    categoryFilter.value = newAllLabel;
  }
});

watch(isLoading, (newVal, oldVal) => {
  console.log('isLoading watcher fired', oldVal, '→', newVal);
  if (oldVal === true && newVal === false) {
    nextTick(() => {
      console.log('resultsTableRef.value is:', resultsTableRef.value);
      resultsTableRef.value?.focusToggle();
    });
  }
});

async function executeSearch() {
  textFilter.value = '';
  categoryFilter.value = $i18n('filters-category-all');
  isPanelCollapsed.value = window.innerWidth < 640;
  await store.executeSearch();
}



function collapsePanel() {
  // blur any focused element inside the search panel
  if (document.activeElement) {
    document.activeElement.blur();
  }
  isPanelCollapsed.value = true;
}

const filteredResults = computed(() => {
  let filtered = results.value;
  
  // text filter
  if (textFilter.value) {
    const search = textFilter.value.toLowerCase();
    filtered = filtered.filter(r => 
      r.lemma.toLowerCase().includes(search) || 
      r.lexemeId.toLowerCase().includes(search)
    );
  }
  
  // category filter - check against translated "all" label
  if (categoryFilter.value && categoryFilter.value !== $i18n('filters-category-all')) {
    filtered = filtered.filter(r => r.lexicalCategory === categoryFilter.value);
  }
  
  return filtered;
});


const textInputRef = ref(null);

watch(textFilter, (newVal) => {
  if (newVal && textInputRef.value) {
    nextTick(() => {
      const clearIcon = textInputRef.value.$el.querySelector('.cdx-text-input__clear-icon');
      if (clearIcon) {
        clearIcon.setAttribute('aria-label', $i18n('filters-text-clear-aria'));
        clearIcon.setAttribute('role', 'button');
        clearIcon.setAttribute('tabindex', '0');
        
        // add keyboard handler
        clearIcon.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            clearIcon.click();
          }
        });
      }
    });
  }
});


const allCategoryMenuItems = computed(() => {
  // count occurrences
  const categoryCounts = {};
  results.value.forEach(r => {
    categoryCounts[r.lexicalCategory] = (categoryCounts[r.lexicalCategory] || 0) + 1;
  });
  
  // sort by count (descending), then alphabetically for ties
  const categories = Object.keys(categoryCounts).sort((a, b) => {
    const countDiff = categoryCounts[b] - categoryCounts[a];
    return countDiff !== 0 ? countDiff : a.localeCompare(b);
  });
  
  const allLabel = $i18n('filters-category-all');
  return [
    { label: allLabel, value: allLabel },
    ...categories.map(cat => ({ label: cat, value: cat }))
  ];
});

const filteredCategoryMenuItems = computed(() => {
  if (!categorySearchTerm.value) return allCategoryMenuItems.value;
  const search = categorySearchTerm.value.toLowerCase();
  return allCategoryMenuItems.value.filter(item => 
    item.label.toLowerCase().includes(search)
  );
});

const categoryFilterError = computed(() => {
  if (!categoryFilterBlurred.value) return '';
  if (categoryFilter.value === $i18n('filters-category-all') || !categoryFilter.value) return '';
  
  const validCategories = results.value.map(r => r.lexicalCategory);
  if (!validCategories.includes(categoryFilter.value)) {
    return $i18n('errors-lexical-category-not-found');
  }
  return '';
});

const categoryFilterErrorRef = ref(null);

watch(categoryFilterError, (newError) => {
  if (newError) {
    nextTick(() => {
      categoryFilterErrorRef.value?.$el?.focus();
    });
  }
});


const activeFilterCount = computed(() => {
  let count = 0;
  if (textFilter.value) count++;
  if (categoryFilter.value && categoryFilter.value !== $i18n('filters-category-all')) count++;
  return count;
});

function onCategoryInput(event) {
  categorySearchTerm.value = event.target.value;
  // reset blur flag when user starts typing
  if (categoryFilterBlurred.value) {
    categoryFilterBlurred.value = false;
  }
}

function clearFilters() {
  textFilter.value = '';
  categoryFilter.value = $i18n('filters-category-all');
  categorySearchTerm.value = '';
}

const hasActiveFilters = computed(() => {
  return textFilter.value.trim() !== '' || 
         (categoryFilter.value !== '' && categoryFilter.value !== $i18n('filters-category-all'));
});
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color-base);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* MOBILE FIRST */
.landing-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-100);
  flex: 1;
}

.body-frame {
  width: 100%;
  max-width: calc(100vw - 2 * var(--spacing-100)); 
  display: flex;
  flex-direction: column; /* stack vertically on mobile */
  gap: var(--spacing-100); 
}

.section-text {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.section-form {
  width: 100%;
}

.landing-view h1 {
  font-family: var(--font-family-serif);
  font-size: 2rem;
  font-weight: 400;
  line-height: 1.25;
  color: var(--color-emphasized);
  margin: 0 0 var(--spacing-50) 0;
}

.subtitle {
  color: var(--color-subtle);
  margin: 0;
}

.landing-search-panel {
  width: 100%;
  box-sizing: border-box; /* includes padding/border in width */
  background-color: var(--background-color-interactive);
  border: 0.0625rem solid var(--border-color-base);
  border-radius: var(--border-radius-base);
  padding: var(--spacing-75);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-75);
}


/* LANDING VIEW - TABLET PORTRAIT */
@media (min-width: 640px) and (max-width: 1023px) {
  .landing-view {
    padding: var(--spacing-200); /* 32px padding */
  }

  .body-frame {
    justify-content: flex-start; /* top-align instead of center */
    gap: var(--spacing-200); /* 32px between h1 section and search panel */
  }
  
  .section-text {
    width: 100%;
  }
  
  .section-form {
    width: 100%;
  }
  
}


/* LANDING VIEW - DESKTOP */
@media (min-width: 1024px) {
  .landing-view {
    padding: var(--spacing-200); 
  }

  .body-frame {
    max-width: 56rem; 
    flex-direction: row; /* side-by-side */
    gap: var(--spacing-150); 
  }

  .section-text {
    width: 30rem; 
  }

  .section-form {
    width: 24rem; 
  }

}

/* SEARCH VIEW - MOBILE FIRST */
.search-view {
  padding: var(--spacing-100); 
  flex: 1;
}

.search-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-100);
}

.header-row {
  display: flex;
  flex-direction: column-reverse; /* stack on mobile */
  align-items: flex-start; /* align to left */
  gap: var(--spacing-100);
}

/* DESKTOP */
@media (min-width: 1024px) {
  .header-row {
    flex-direction: row;
    align-items: center;
  }

  .header-row h1 {
    flex: 1; /* h1 takes remaining space */
  }
}

.search-content h1 {
  color: var(--color-emphasized);
  font-family: var(--font-family-serif); 
  font-size: 2rem;
  font-weight: 400;
  line-height: 1.25;
  margin: 0;
  width: 100%; /* full width on mobile */
}

.search-layout {
  width: 100%;
  display: flex;
  flex-direction: column; /* stack on mobile */
  align-items: flex-start;
  gap: var(--spacing-100);
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-75);
}

.search-heading {
  margin: 0;
  color: var(--color-emphasized);
  font-weight: 700;
}

/* search results page search panel */
.results-search-panel {
  width: 100%;
  background-color: var(--background-color-interactive);
  border: 0.0625rem solid var(--border-color-base);
  border-radius: var(--border-radius-base);
  padding: var(--spacing-75);
}

.results-search-panel :deep(.cdx-field) {
  margin-bottom: 0;
}

.results-area {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.collapse-button {
  width: var(--size-200);
  height: var(--size-200);
}

.collapse-button,
.expand-button {
  background-color: var(--background-color-interactive-subtle) !important;
  border: 1px solid var(--border-color-interactive) !important;
}

.expand-button {
  width: 100% !important;
  max-width: none !important;
  font-size: var(--font-size-medium);
  line-height: var(--line-height-small);
  font-weight: 700;
}

@media (min-width: 1024px) {
  .expand-button {
    width: auto !important;
    max-width: none !important;
    white-space: nowrap !important;
    padding: var(--spacing-25) var(--spacing-75) !important;
    flex-shrink: 0;
  }
}

/* SEARCH VIEW - TABLET PORTRAIT */
@media (min-width: 640px) and (max-width: 1023px) {
  .search-view {
    padding: var(--spacing-200); /* 32px on tablet */
  }
  
  .search-layout {
    flex-direction: column; /* vertical stack like mobile */
    gap: var(--spacing-150); /* 24px gutter */
  }
  
  .results-search-panel {
    width: 100%; /* full width in vertical layout */
  }
}

/* SEARCH VIEW - DESKTOP */
@media (min-width: 1024px) {
  .search-view {
    padding: var(--spacing-200); /* 32px on desktop */
  }

  .search-layout {
    flex-direction: row; /* side-by-side on desktop */
    gap: var(--spacing-150); /* 24px gutter */
    min-height: 25.5rem;
  }

  .results-search-panel {
    width: 24rem;
    max-width: 24rem;
  }
}

.filter-divider {
  width: 100%;
  height: 0.0625rem;
  background-color: var(--border-color-base);
  margin-top: var(--spacing-75);
  margin-bottom: var(--spacing-75);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-75);
}

.filters-header h3 {
  margin: 0;
  font-size: var(--font-size-large);
  font-weight: 700;
  color: var(--color-emphasized);
}


.clear-filters-button {
  border-radius: var(--border-radius-base);
  border: 0.0625rem solid var(--border-color-interactive) !important;
  background-color: var(--background-color-interactive-subtle) !important;
  color: var(--color-base) !important;
  font-size: var(--font-size-medium);
  font-weight: 700;
  line-height: var(--line-height-small);
  font-family: var(--font-family-system-sans);
}

.clear-filters-button:disabled {
  border: 0.0625rem solid var(--border-color-transparent) !important;
  background-color: var(--background-color-disabled) !important;
  color: var(--color-disabled) !important;
  cursor: not-allowed;
}

.filters-controls :deep(.cdx-label) {
  padding-bottom: var(--spacing-25);
}

.filters-controls :deep(.cdx-label__label__text) {
  overflow: visible;
  text-overflow: ellipsis;
}

:deep(.cdx-combobox) {
  width: 100%;
}

:deep(.cdx-combobox__input) {
  width: 100%;
}

.category-filter-error {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-50);
  color: var(--color-error);
  font-size: var(--font-size-medium);
  font-weight: 400 !important;
  margin-top: var(--spacing-25);
}

.category-filter-error :deep(.cdx-icon) {
  margin-top: 2px;
  color: var(--color-error);
  width: 20px;
  height: 20px;
  min-width: 20px;
}

.category-filter-error :deep(.cdx-message__content) {
  margin-left: 0;
  line-height: var(--line-height-small);
}
</style>
