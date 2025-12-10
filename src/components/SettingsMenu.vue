<!--
  Broomstick - AccountMenu settings 
  A tool to identify Lexemes on Wikidata that can be improved
  
  @license GPL-2.0-or-later
  @see https://github.com/wikicollabs/broomstick
-->

<template>
  <div class="settings-menu">
    <cdx-menu-button
      v-model:selected="selectedItem"
      :menu-items="menuItems"
      :aria-label="$i18n('settings-menu-label-aria')"
    >
      <template #default>
        <cdx-icon :icon="cdxIconMenu" />
      </template>
    </cdx-menu-button>

    <!-- theme dialog -->
    <cdx-dialog
      v-model:open="showThemeDialog"
      :title="$i18n('settings-theme-label')"
      :use-close-button="true"
      :primary-action="{
        label: $i18n('settings-apply'),
        actionType: 'progressive',
        ariaLabel: $i18n('settings-apply'),
        disabled: !hasThemeChanged,
      }"
      :default-action="{
        label: $i18n('settings-cancel'),
        ariaLabel: $i18n('settings-cancel'),
      }"
      @primary="saveTheme"
      @default="showThemeDialog = false"
    >
      <div class="dialog-content">
        <cdx-field :is-fieldset="true"> 
          <cdx-radio v-model="tempTheme" name="theme" input-value="auto" :aria-label="$i18n('settings-theme-auto-aria')">
            <template #default> {{ $i18n('settings-theme-auto') }} </template>
            <template #description>
              <span class="radio-description">{{ $i18n('settings-theme-auto-description') }}</span>
            </template>
          </cdx-radio>
          <cdx-radio v-model="tempTheme" name="theme" input-value="light" :aria-label="$i18n('settings-theme-light')">
            {{ $i18n('settings-theme-light') }}
          </cdx-radio>
          <cdx-radio v-model="tempTheme" name="theme" input-value="dark" :aria-label="$i18n('settings-theme-dark')">
            {{ $i18n('settings-theme-dark') }}
          </cdx-radio>
        </cdx-field>
      </div>
    </cdx-dialog>

    <!-- display language dialog -->
    <cdx-dialog
      v-model:open="showLanguageDialog"
      :title="$i18n('settings-language-label')"
      :use-close-button="true"
      :primary-action="{
        label: $i18n('settings-apply'),
        actionType: 'progressive',
        disabled: !hasLanguageChanged,
        ariaLabel: $i18n('settings-apply'),
      }"
      :default-action="{
        label: $i18n('settings-cancel'),
        ariaLabel: $i18n('settings-cancel'),
      }"
      @primary="saveLanguage"
      @default="showLanguageDialog = false"
    >
      <div class="dialog-content">
        <cdx-field :is-fieldset="true">
          <cdx-radio v-for="lang in DISPLAY_LANGUAGES" :key="lang.code" v-model="tempLanguage" name="language" :input-value="lang.code">
            {{ lang.nativeName }}
          </cdx-radio>
        </cdx-field>
      </div>
            <template #footer-text>
        <p class ="language-reload">
          {{ $i18n('settings-language-reload') }}
        </p>
        <p class="translate-help">
          {{ $i18n('settings-translate-help') }}
          <a 
            href="https://translatewiki.net/wiki/Translating:Broomstick" 
            target="_blank" 
            rel="noopener"
            class="translate-link"
          >
            {{ $i18n('settings-translate-link') }}
          </a>
        </p>
      </template>
    </cdx-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, getCurrentInstance} from "vue";
import {
  CdxMenuButton,
  CdxDialog,
  CdxField,
  CdxRadio,
  CdxIcon,
  CdxButton
} from "@wikimedia/codex";
import {
  cdxIconMenu,
  cdxIconBright,
  cdxIconMoon,
  cdxIconLanguage,
} from "@wikimedia/codex-icons";
import { DISPLAY_LANGUAGES } from '../i18n/displayLanguages.js';

const instance = getCurrentInstance();
const $i18n = instance?.appContext.config.globalProperties.$i18n;



const getLanguageName = (locale) => {
  return DISPLAY_LANGUAGES.find(l => l.code === locale)?.nativeName || locale;
}



const selectedItem = ref(null);
const currentTheme = ref("auto");
const currentLanguage = ref(localStorage.getItem('locale') || 'en');  

const tempTheme = ref("auto");
const tempLanguage = ref(currentLanguage.value);

const showThemeDialog = ref(false);
const showLanguageDialog = ref(false);

const themeLabel = computed(() => {
  const labels = {
    auto: $i18n('settings-theme-auto'),
    light: $i18n('settings-theme-light'),
    dark: $i18n('settings-theme-dark'),
  };
  return labels[currentTheme.value];
});

const languageLabel = computed(() => {
  const lang = DISPLAY_LANGUAGES.find(l => l.code === currentLanguage.value);
  return lang ? lang.nativeName : 'English';
});

const effectiveTheme = computed(() => {
  if (currentTheme.value !== "auto") return currentTheme.value;
  return systemTheme.value;
});

const menuItems = computed(() => {
  
  return [
    {
      value: "theme",
      label: $i18n('settings-theme-label'),
      description: themeLabel.value,
      ariaLabel: `${$i18n('settings-theme-label')}: ${themeLabel.value}`,
      icon: effectiveTheme.value === "dark" ? cdxIconMoon : cdxIconBright,
    },
    {
      value: "language",
      label: $i18n('settings-language-label'),
      description: languageLabel.value,
      ariaLabel: `${$i18n('settings-language-label')}: ${languageLabel.value}`,
      icon: cdxIconLanguage,
    },
  ];
});

watch(selectedItem, (newValue) => {
  if (newValue === "theme") {
    tempTheme.value = currentTheme.value;
    showThemeDialog.value = true;
    selectedItem.value = null;
} else if (newValue === "language") {
  tempLanguage.value = currentLanguage.value;
  showLanguageDialog.value = true;
  selectedItem.value = null;
}
});

function saveTheme() {
  currentTheme.value = tempTheme.value;
  showThemeDialog.value = false;

  // save to localStorage
  localStorage.setItem("theme", tempTheme.value);

  // apply theme to html element
  applyTheme(tempTheme.value);
}

function restoreTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    currentTheme.value = savedTheme;
    applyTheme(savedTheme);
  } else {
    // default to auto if nothing saved
    currentTheme.value = "auto";
  }
}

const systemTheme = ref(
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
);

const hasThemeChanged = computed(() => {
  return tempTheme.value !== currentTheme.value;
});

const hasLanguageChanged = computed(() => {
  const currentLocale = localStorage.getItem('locale') || 'en';
  return tempLanguage.value !== currentLocale;
});

onMounted(() => {
  restoreTheme();

  const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  darkModeQuery.addEventListener("change", (e) => {
    systemTheme.value = e.matches ? "dark" : "light";
    if (currentTheme.value === "auto") {
      applyTheme("auto");
    }
  });

    // WORKAROUND: Codex MenuButton keyboard accessibility issue
  // 
  // Problem: MenuButton blocks Enter/Space from reaching Menu's selection logic
  // - MenuButton.onKeydown returns early for Enter/Space keys
  // - This prevents Menu.delegateKeyNavigation from handling selection
  // - Tab key works fine bc it's not blocked
  // 
  // Impact: Keyboard users can navigate menu but can't select with Enter/Space
  // 
  // This listener catches Enter/Space when menu is expanded and manually triggers
  // the dialogs, replicating what Menu.handleKeyNavigation should do.
  // 
  // TODO: Remove this once Codex fixes MenuButton to delegate Enter/Space to Menu
  // Related: https://github.com/wikimedia/design-codex/commit/f6c7f1f330cc050cb67a2d9a61d81f2ca85eb121

  
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    
    const button = e.target.closest('button[aria-haspopup="menu"]');
    if (!button) return;
    
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    if (!isExpanded) return;
    
    const menuId = button.getAttribute('aria-controls');
    const menu = document.getElementById(menuId);
    if (!menu) return;
    
    const highlighted = menu.querySelector('.cdx-menu-item--highlighted');
    if (!highlighted) return;
    
    const ariaLabel = highlighted.getAttribute('aria-label');
    
    if (ariaLabel?.includes($i18n('settings-theme-label'))) {
      e.preventDefault();
      e.stopPropagation();
      tempTheme.value = currentTheme.value;
      showThemeDialog.value = true;
      selectedItem.value = null;
    } else if (ariaLabel?.includes($i18n('settings-language-label'))) {
      e.preventDefault();
      e.stopPropagation();
      tempLanguage.value = currentLanguage.value;
      showLanguageDialog.value = true;
      selectedItem.value = null;
    }
  }, true);
});

function applyTheme(theme) {
  const html = document.documentElement;

  if (theme === "dark") {
    html.classList.remove("light");
    html.classList.add("dark");
  } else if (theme === "light") {
    html.classList.remove("dark");
    html.classList.add("light");
  } else {
    // auto
    html.classList.remove("dark", "light");
    // check system preference and apply it
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      html.classList.add("dark");
    }
  }
}

function saveLanguage() {
  currentLanguage.value = tempLanguage.value; 
  
  const newLangName = getLanguageName(currentLanguage.value);
  
  localStorage.setItem('locale', currentLanguage.value);
  localStorage.setItem('language_change_toast', newLangName);
  localStorage.setItem('broomstick_skip_requery', 'true');
  window.location.reload();
}
</script>

<style scoped>
.settings-menu {
  display: flex;
  align-items: center;
}

.dialog-content {
  color: var(--color-base);
  margin-bottom: calc(var(--spacing-50) - var(--spacing-100));
}

.radio-description {
  color: var(--color-subtle);
  font-family: var(--font-family-system-sans);
}

:deep(.cdx-label__label__text) {
  font-family: var(--font-family-system-sans);
}

:deep(.cdx-dialog__footer) {
  padding: var(--spacing-125) var(--spacing-150) var(--spacing-150) !important;
}

.footer-buttons {
  display: flex;
  gap: var(--spacing-75);
  width: 100%;
  justify-content: flex-end;
  margin-top: var(--spacing-50);
}

:deep(.cancel-button.cdx-button) {
  border-radius: var(--border-radius-base);
  border: 1px solid var(--border-color-interactive);
  background: var(--background-color-interactive-subtle);
}

.language-reload {
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
  margin: 0;
  margin-bottom: var(--spacing-75);
}

.translate-help {
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
  margin: 0;
}

.translate-link {
  color: var(--color-progressive);
  text-decoration: none;
  line-height: var(--line-height-small);
}
</style>
