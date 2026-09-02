<!--
  Broomstick - Search Form
  A tool to identify Lexemes on Wikidata that can be improved
  
  @license GPL-2.0-or-later
  @see https://github.com/wikicollabs/broomstick
-->

<template>
  <div class="search-form">
    <cdx-field
      class="language-type-field"
      :status="languageError ? 'error' : 'default'"
    >
      <template #label>{{ $i18n('search-language-label') }}</template>
      <language-select
        v-model:selected="selectedLanguageValue"
        :disabled="disabled"
        :placeholder="$i18n('search-language-placeholder')"
        :search-placeholder="$i18n('search-language-placeholder')"
        :aria-label="$i18n('search-language-label')"
        :search-aria-label="$i18n('search-language-label')"
        :no-results-text="$i18n('search-language-no-results')"
        @blur="onLanguageBlur"
        @focus="onLanguageFocus"
      />
    </cdx-field>
    <cdx-message
      v-if="languageError"
      type="error"
      :inline="true"
      class="error-message"
      ref="languageErrorRef"
      tabindex="-1"
    >
      {{ languageError }}
    </cdx-message>

    <cdx-field
      class="gap-type-field"
      :status="gapTypeError ? 'error' : 'default'"
    >
      <template #label>{{ $i18n('search-query-label') }}</template>
      <cdx-select
        v-model:selected="selectedGapTypeValue"
        :menu-items="gapTypeOptions"
        :default-label="$i18n('search-query-placeholder')"
        :status="gapTypeError ? 'error' : 'default'"
        :aria-label="$i18n('search-query-label')"
        @blur="onGapTypeBlur"
        @focus="onGapTypeFocus"
      />
    </cdx-field>
    <cdx-message
      v-if="gapTypeError"
      type="error"
      :inline="true"
      class="error-message"
      ref="gapTypeErrorRef"
      tabindex="-1"
    >
      {{ gapTypeError }}
    </cdx-message>

    <cdx-button
      action="progressive"
      weight="primary"
      type="button"
      :disabled="isSearchDisabled"
      :aria-label="$i18n('search-button')"
      :aria-disabled="isSearchDisabled"
      @click="handleSearch"
      class="search-button"
    >
      <cdx-icon :icon="cdxIconSearch" />
      {{ $i18n('search-button') }}
    </cdx-button>

    <cdx-message 
      v-if="hasChangedSelection && resultsExist && activeFilterCount > 0"
      type="notice"
      inline
      class="selection-change-notice"
      role="status"
    >
      {{ $i18n('search-form-filter-clear-notice') }}
    </cdx-message>
  </div>
</template>

<script setup>
import { computed, ref, watch, getCurrentInstance, nextTick } from "vue";
import { CdxField, CdxSelect, CdxButton, CdxIcon, CdxMessage } from "@wikimedia/codex";
import { cdxIconSearch, cdxIconError } from "@wikimedia/codex-icons";
import { LANGUAGES, getAvailableQueriesForLanguage } from "../data/languages.js";
import { getQueryOptionsForLanguage } from "../data/queryOptions.js";
import LanguageSelect from "./LanguageSelect.vue";

const instance = getCurrentInstance();
const $i18n = instance?.appContext.config.globalProperties.$i18n;

const props = defineProps({
  language: {
    type: String,
    default: "English (en)",
  },
  gapType: {
    type: String,
    default: "is-empty",
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  activeFilterCount: {
  type: Number,
  default: 0
},

  resultsExist: Boolean
});

const hasChangedSelection = ref(false);

watch([() => props.language, () => props.gapType], () => {
  if (props.resultsExist) {
    hasChangedSelection.value = true;
  }
});

const emit = defineEmits(["update:language", "update:gapType", "search"]);

const languageOptions = LANGUAGES.map((lang) => ({
  value: lang.display,
  label: lang.display,
}));

const gapTypeOptions = computed(() => {
  const rawOptions = getQueryOptionsForLanguage(props.language);
  // translate the category labels and item labels here
  return rawOptions.map(group => ({
    label: $i18n(group.label), // translate category
    items: group.items.map(item => ({
      value: item.value,
      label: item.params ? $i18n(item.label, ...item.params) : $i18n(item.label)
    }))
  }));
});

const availableGapTypeValues = computed(() =>
  props.language ? getAvailableQueriesForLanguage(props.language) : []
);

watch(() => props.language, () => {
  if (props.gapType && !availableGapTypeValues.value.includes(props.gapType)) {
    emit("update:gapType", "");
  }
});

const languageBlurred = ref(false);
const gapTypeBlurred = ref(false);

const selectedLanguageValue = computed({
  get() {
    return props.language;
  },
  set(value) {
    emit("update:language", value);
  },
});

const selectedGapTypeValue = computed({
  get() {
    return props.gapType || null;
  },
  set(value) {
    emit("update:gapType", value ?? "");
  },
});

const languageError = computed(() => {
  if (!languageBlurred.value) return "";
  if (!props.language) return "";

  const validValues = languageOptions.map((opt) => opt.value);
  if (!validValues.includes(props.language)) {
    return $i18n('errors-language-not-found');
  }
  return "";
});

const languageErrorRef = ref(null);

// watch for when the error appears
watch(languageError, (newError) => {
  if (newError) {
    nextTick(() => {
      languageErrorRef.value?.focus();
    });
  }
});

const gapTypeError = computed(() => {
  if (!gapTypeBlurred.value) return "";
  if (!props.gapType) return "";

  if (!availableGapTypeValues.value.includes(props.gapType)) {
    return $i18n('errors-query-not-found');
  }
  return "";
});

const gapTypeErrorRef = ref(null);

watch(gapTypeError, (newError) => {
  if (newError) {
    nextTick(() => {
      gapTypeErrorRef.value?.focus();
    });
  }
});

const isSearchDisabled = computed(() => {
  if (!props.language || !props.gapType) return true;
  if (props.disabled) return true;

  const validLanguages = languageOptions.map((opt) => opt.value);

  if (!validLanguages.includes(props.language)) return true;
  if (!availableGapTypeValues.value.includes(props.gapType)) return true;

  return false;
});


function onLanguageBlur() {
  languageBlurred.value = true;
}

function onGapTypeBlur() {
  gapTypeBlurred.value = true;
}

function onLanguageFocus() {
  languageBlurred.value = false;
}

function onGapTypeFocus() {
  gapTypeBlurred.value = false;
}

function handleSearch() {
  hasChangedSelection.value = false;
  languageBlurred.value = true;
  gapTypeBlurred.value = true;

  if (!languageError.value && !gapTypeError.value) {
    emit("search");
  }
}
</script>

<style scoped>
.language-type-field,
.gap-type-field {
  margin-bottom: var(--spacing-75) !important;
}

.language-type-field + .error-message,
.gap-type-field + .error-message {
  margin-top: calc(var(--spacing-75) * -1);
  margin-bottom: var(--spacing-75) !important;
}

.error-message {
  margin-bottom: var(--spacing-75);
}

.gap-type-field {
  margin-top: 0 !important;
}

.gap-type-field :deep(.cdx-field__control) {
  display: flex;
}

.search-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.search-form :deep(.cdx-field) {
  margin-block-start: 0 !important;
}

.search-button {
  width: 100%;
  min-width: 0; /* CRITICAL - allows it to shrink below codex defaults */
  max-width: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-50);
}

@media (min-width: 640px) {
  .search-button {
    width: 100%;
  }
}

.selection-change-notice {
  display: flex;
  align-items: flex-start;
  align-self: flex-start;
  gap: var(--spacing-50);
  color: var(--color-base);
  font-size: var(--font-size-medium);
  font-weight: 400 !important;
  margin-top: 0.75rem !important; 
}

.selection-change-notice :deep(.cdx-icon) {
  margin-top: 2px;
  color: var(--color-notice);
  width: 20px;
  height: 20px;
  min-width: 20px;
}

.selection-change-notice :deep(.cdx-message__content) {
  margin-left: 0;
  line-height: var(--line-height-small);
}

:deep(.cdx-field) {
  width: 100%;
  min-width: 0;
}

:deep(.cdx-select-vue) {
  width: 100%;
  min-width: 0;
}

:deep(.cdx-select-vue__handle) {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

:deep(.cdx-text-input) {
  width: 100%;
  min-width: 0;
}

:deep(.cdx-text-input__input) {
  width: 100%;
  min-width: 0;
}

:deep(.language-type-field) {
  margin-top: 0;
}
:deep(.gap-type-field) {
  margin-top: 0;
}
:deep(.cdx-field--status-error .cdx-text-input__input) {
  background-color: var(--background-color-error-subtle);
}
:deep(.cdx-field--status-error .cdx-select-vue__handle) {
  background-color: var(--background-color-error-subtle);
}
</style>
