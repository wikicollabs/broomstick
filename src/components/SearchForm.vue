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
      <cdx-combobox
        v-model:selected="selectedLanguageValue"
        :menu-items="filteredLanguageOptions"
        :placeholder="$i18n('search-language-placeholder')"
        :aria-label="$i18n('search-language-label')"
        :class="{ 'combobox-error': languageError }"
        @input="onLanguageInput"
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
      <cdx-combobox
        :selected="getDisplayValue(selectedGapTypeValue)"
        :menu-items="filteredGapTypeOptions"
        @update:selected="onQuerySelected"
        :placeholder="$i18n('search-query-placeholder')"
        :aria-label="$i18n('search-query-label')"
        :class="{ 'combobox-error': gapTypeError }"
        @input="onGapTypeInput"
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
import { CdxField, CdxCombobox, CdxButton, CdxIcon, CdxMessage } from "@wikimedia/codex";
import { cdxIconSearch, cdxIconError } from "@wikimedia/codex-icons";
import { LANGUAGES } from "../data/languages.js";
import {
  getQueryOptionsForLanguage,
  getAllQueryValues,
} from "../data/queries.js";
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

const languageSearchTerm = ref("");
const gapTypeSearchTerm = ref("");
const languageBlurred = ref(false);
const gapTypeBlurred = ref(false);

const filteredLanguageOptions = computed(() => {
  if (!languageSearchTerm.value) return languageOptions;
  const search = languageSearchTerm.value.toLowerCase();
  return languageOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search)
  );
});

const filteredGapTypeOptions = computed(() => {
  if (!gapTypeSearchTerm.value) return gapTypeOptions.value;
  const search = gapTypeSearchTerm.value.toLowerCase();

  return gapTypeOptions.value
    .map((group) => ({
      label: group.label,
      items: group.items.filter((opt) =>
        opt.label.toLowerCase().includes(search)
      ),
    }))
    .filter((group) => group.items.length > 0);
});

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
    return props.gapType;
  },
  set(value) {
    emit("update:gapType", value);
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

  const validValues = getAllQueryValues();
  if (!validValues.includes(props.gapType)) {
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
  const validGapTypes = getAllQueryValues();

  if (!validLanguages.includes(props.language)) return true;
  if (!validGapTypes.includes(props.gapType)) return true;

  return false;
});

function onLanguageInput(event) {
  languageSearchTerm.value = event.target.value;
  // clear blur flag when user starts typing again
  if (languageBlurred.value && event.target.value === "") {
    languageBlurred.value = false;
  }
}

function onGapTypeInput(event) {
  gapTypeSearchTerm.value = event.target.value;
  // clear blur flag when user starts typing again
  if (gapTypeBlurred.value && event.target.value === "") {
    gapTypeBlurred.value = false;
  }
}

// finds the translated label for display
function getDisplayValue(value) {
  if (!value) return '';
  
  for (const group of filteredGapTypeOptions.value) {
    const item = group.items.find(i => i.value === value);
    if (item) return item.label; // this is already translated from getQueryOptionsForLanguage
  }
  return value;
}

// handles selection, emits the VALUE (for sparql lookup)
function onQuerySelected(selectedValue) {
  
  // combobox sends the value directly, just emit it
  emit("update:gapType", selectedValue);
}

function onLanguageBlur() {
  languageBlurred.value = true;
}

function onGapTypeBlur() {
  gapTypeBlurred.value = true;
}

function onLanguageFocus() {
  // clear search term if there's an error, allowing dropdown to work
  if (languageError.value && languageSearchTerm.value) {
    languageSearchTerm.value = "";
  }
  languageBlurred.value = false;
}

function onGapTypeFocus() {
  // clear search term if there's an error, allowing dropdown to work
  if (gapTypeError.value && gapTypeSearchTerm.value) {
    gapTypeSearchTerm.value = "";
  }
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
:deep(.combobox-error .cdx-text-input__input) {
  color: var(--color-error) !important;
}

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

:deep(.cdx-combobox) {
  width: 100%;
  min-width: 0;
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
</style>
