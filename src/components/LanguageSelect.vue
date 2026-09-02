<!--
  Broomstick - Language selector
  @license GPL-2.0-or-later
-->
<template>
  <searchable-select
    :menu-items="languageOptions"
    :selected="selected"
    :disabled="disabled"
    :default-label="placeholder"
    :search-placeholder="searchPlaceholder || placeholder"
    :aria-label="ariaLabel"
    :search-aria-label="searchAriaLabel || ariaLabel"
    :no-results-text="noResultsText"
    @update:selected="onSelect"
    @focus="$emit('focus')"
    @blur="$emit('blur')"
  />
</template>

<script setup>
import { computed } from "vue";
import SearchableSelect from "./SearchableSelect.vue";
import { LANGUAGES } from "../data/languages.js";

const props = defineProps({
  selected: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "",
  },
  searchPlaceholder: {
    type: String,
    default: "",
  },
  ariaLabel: {
    type: String,
    default: "",
  },
  searchAriaLabel: {
    type: String,
    default: "",
  },
  noResultsText: {
    type: String,
    default: "No results found.",
  },
});

const emit = defineEmits(["update:selected", "focus", "blur"]);

const languageOptions = computed(() =>
  LANGUAGES.map((language) => ({
    value: language.display,
    label: language.display,
  }))
);

function onSelect(value) {
  emit("update:selected", typeof value === "string" ? value : "");
}
</script>
