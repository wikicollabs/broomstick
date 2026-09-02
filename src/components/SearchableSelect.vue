<!--
  Broomstick - Reusable searchable select
  @license GPL-2.0-or-later
-->
<template>
  <div
    ref="wrapperRef"
    class="searchable-select"
    :class="{
      'searchable-select--disabled': disabled,
      'searchable-select--expanded': isExpanded,
    }"
  >
    <div class="searchable-select__trigger">
      <cdx-select
        :selected="selected"
        :menu-items="[]"
        :default-label="defaultLabel"
        class="searchable-select__visual"
        aria-hidden="true"
        tabindex="-1"
        inert
      >
        <template #label>
          <span
            class="searchable-select__label"
            :class="{ 'searchable-select__label--placeholder': !selectedLabel }"
          >
            {{ selectedLabel || defaultLabel }}
          </span>
        </template>
      </cdx-select>

      <button
        ref="handleRef"
        type="button"
        class="searchable-select__handle"
        :disabled="disabled"
        :aria-label="ariaLabel"
        aria-haspopup="listbox"
        :aria-expanded="isExpanded"
        :aria-controls="menuId"
        @click="toggleMenu"
        @keydown="onHandleKeydown"
      />
    </div>

    <div
      v-show="isExpanded"
      class="searchable-select__popup"
    >
      <div class="searchable-select__search">
        <cdx-text-input
          ref="searchInputRef"
          v-model="searchQuery"
          input-type="search"
          :start-icon="cdxIconSearch"
          :clearable="true"
          :placeholder="searchPlaceholder"
          :aria-label="searchAriaLabel || searchPlaceholder"
          :aria-controls="menuId"
          aria-autocomplete="list"
          @keydown="onSearchKeydown"
        />
      </div>

      <cdx-menu
        :id="menuId"
        ref="menuRef"
        :selected="selected"
        :menu-items="filteredMenuItems"
        :expanded="isExpanded"
        :visible-item-limit="visibleItemLimit"
        @update:selected="onSelect"
      >
        <template #no-results>
          <span class="searchable-select__no-results">
            {{ noResultsText }}
          </span>
        </template>
      </cdx-menu>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
} from "vue";
import { CdxMenu, CdxSelect, CdxTextInput } from "@wikimedia/codex";
import { cdxIconSearch } from "@wikimedia/codex-icons";

const props = defineProps({
  menuItems: {
    type: Array,
    default: () => [],
  },
  selected: {
    type: [String, Number],
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  defaultLabel: {
    type: String,
    default: "",
  },
  searchPlaceholder: {
    type: String,
    default: "Search",
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
  visibleItemLimit: {
    type: Number,
    default: 5,
  },
});

const emit = defineEmits(["update:selected", "focus", "blur"]);

const wrapperRef = ref(null);
const handleRef = ref(null);
const searchInputRef = ref(null);
const menuRef = ref(null);

const isExpanded = ref(false);
const searchQuery = ref("");
const menuId = `searchable-select-${useId()}`;

const selectedLabel = computed(() => {
  const item = props.menuItems.find((option) => option.value === props.selected);
  return item?.label ?? "";
});

const filteredMenuItems = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase();

  if (!query) {
    return props.menuItems;
  }

  return props.menuItems.filter((item) =>
    String(item.label ?? "")
      .toLocaleLowerCase()
      .includes(query)
  );
});

function openMenu() {
  if (props.disabled || isExpanded.value) {
    return;
  }

  isExpanded.value = true;
  searchQuery.value = "";
  emit("focus");

  nextTick(() => {
    searchInputRef.value?.focus?.();
  });
}

function closeMenu({ refocus = false } = {}) {
  if (!isExpanded.value) {
    return;
  }

  isExpanded.value = false;
  searchQuery.value = "";
  emit("blur");

  if (refocus) {
    nextTick(() => {
      handleRef.value?.focus();
    });
  }
}

function toggleMenu() {
  if (isExpanded.value) {
    closeMenu();
  } else {
    openMenu();
  }
}

function onSelect(value) {
  emit("update:selected", value);
  closeMenu({ refocus: true });
}

function onHandleKeydown(event) {
  if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
    event.preventDefault();
    openMenu();
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeMenu({ refocus: true });
  }
}

function onSearchKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeMenu({ refocus: true });
    return;
  }

  menuRef.value?.delegateKeyNavigation?.(event);
}

function onDocumentPointerDown(event) {
  if (
    isExpanded.value &&
    wrapperRef.value &&
    !wrapperRef.value.contains(event.target)
  ) {
    closeMenu();
  }
}

onMounted(() => {
  document.addEventListener("pointerdown", onDocumentPointerDown);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown);
});
</script>

<style scoped>
.searchable-select {
  position: relative;
  width: 100%;
  min-width: 0;
}

.searchable-select__trigger {
  position: relative;
  z-index: 2;
  width: 100%;
}

.searchable-select__visual {
  display: block;
  width: 100%;
  pointer-events: none;
}

.searchable-select__visual :deep(> *) {
  width: 100%;
}

.searchable-select__visual :deep([role="listbox"]) {
  display: none !important;
}

.searchable-select__handle {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.searchable-select--disabled .searchable-select__handle {
  cursor: not-allowed;
}

.searchable-select--expanded .searchable-select__handle,
.searchable-select__handle:focus-visible {
  border: var(--border-width-base) var(--border-style-base)
    var(--border-color-progressive--focus);
  border-radius: var(--border-radius-base);
  box-shadow: var(--box-shadow-inset-small)
    var(--box-shadow-color-progressive--focus);
  outline: var(--outline-base--focus);
}

.searchable-select__label {
  overflow: hidden;
  color: var(--color-base);
  text-align: start;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.searchable-select__label--placeholder {
  color: var(--color-placeholder);
}

.searchable-select__popup {
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  z-index: 1;
  margin-top: -1px;
  overflow: hidden;
  background: var(--background-color-base);
  border: var(--border-width-base) var(--border-style-base)
    var(--border-color-interactive);
  border-radius: 0 0 var(--border-radius-base) var(--border-radius-base);
  box-shadow: var(
    --box-shadow-drop-medium,
    0 2px 6px rgb(0 0 0 / 15%)
  );
}

.searchable-select__search {
  padding: var(--spacing-50);
  border-bottom: var(--border-width-base) var(--border-style-base)
    var(--border-color-subtle);
}

.searchable-select__search :deep(.cdx-text-input) {
  width: 100%;
}

.searchable-select__popup :deep(.cdx-menu) {
  position: static;
  width: 100%;
  max-width: none;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.searchable-select__no-results {
  color: var(--color-base);
}
</style>
