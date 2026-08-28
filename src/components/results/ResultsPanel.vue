<!--
  Broomstick - Results Panel
  A tool to identify Lexemes on Wikidata that can be improved

  @license GPL-2.0-or-later
  @see https://github.com/wikicollabs/broomstick
-->

<template>
  <div v-if="isLoading" class="loading-state" role="status" aria-live="assertive">
    <h3>{{ $i18n('results-querying') }}</h3>
    <CdxProgressBar :aria-label="$i18n('results-querying-aria')" aria-hidden="true" />
  </div>

  <CdxMessage v-else-if="error" type="error">
    {{ error }}
  </CdxMessage>

  <div v-else>
    <ResultsTable
      ref="resultsTableRef"
      :results="results"
      :total-count="totalCount"
      :text-filter="textFilter"
      :connection-error="connectionError"
      :is-loading="isLoading"
    />
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from "vue";
import { CdxProgressBar, CdxMessage } from "@wikimedia/codex";
import ResultsTable from "./ResultsTable.vue";

const instance = getCurrentInstance();
const $i18n = instance?.appContext.config.globalProperties.$i18n;

defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
  results: {
    type: Array,
    required: true,
  },
  totalCount: {
    type: Number,
    required: true,
  },
  textFilter: {
    type: String,
    default: '',
  },
  connectionError: {
    type: Boolean,
    default: false,
  },
});

const resultsTableRef = ref(null);

function focusToggle() {
  resultsTableRef.value?.focusToggle();
}

defineExpose({ focusToggle });
</script>

<style scoped>
.loading-state {
  padding: var(--spacing-100);
  border: 0.0625rem solid var(--border-color-base);
  border-radius: var(--border-radius-base);
  width: 100%;
}

.loading-state h3 {
  margin: 0 0 var(--spacing-100) 0;
  color: var(--color-emphasized);
  text-align: center;
}

.loading-state :deep(.cdx-progress-bar__bar) {
  background-color: var(--background-color-progressive) !important;
}

@media (min-width: 1024px) {
  .loading-state :deep(.cdx-progress-bar) {
    max-width: 32rem;
    margin: 0 auto;
  }
}
</style>