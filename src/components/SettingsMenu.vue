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
      :aria-label="$t('settings.menu-label')"
    >
      <template #default>
        <cdx-icon :icon="cdxIconMenu" />
      </template>
    </cdx-menu-button>

    <!-- theme dialog -->
    <cdx-dialog
      v-model:open="showThemeDialog"
      :title="$t('settings.theme-label')"
      :use-close-button="true"
      :primary-action="{
        label: $t('settings.apply'),
        actionType: 'progressive',
      }"
      :default-action="{
        label: $t('settings.cancel'),
      }"
      @primary="saveTheme"
      @default="showThemeDialog = false"
    >
      <div class="dialog-content">
        <cdx-field>
          <cdx-radio v-model="tempTheme" name="theme" input-value="auto">
            <template #default> {{ $t('settings.theme-auto') }} </template>
            <template #description>
              <span class="radio-description">{{ $t('settings.theme-auto-description') }}</span>
            </template>
          </cdx-radio>
          <cdx-radio v-model="tempTheme" name="theme" input-value="light">
            {{ $t('settings.theme-light') }}
          </cdx-radio>
          <cdx-radio v-model="tempTheme" name="theme" input-value="dark">
            {{ $t('settings.theme-dark') }}
          </cdx-radio>
        </cdx-field>
      </div>
    </cdx-dialog>

    <!-- display language dialog -->
    <cdx-dialog
      v-model:open="showLanguageDialog"
      :title="$t('settings.language-label')"
      :use-close-button="true"
    >
      <div class="dialog-content">
        <cdx-field>
          <cdx-radio v-for="lang in DISPLAY_LANGUAGES" :key="lang.code" v-model="tempLanguage" name="language" :input-value="lang.code">
            {{ lang.nativeName }}
          </cdx-radio>
        </cdx-field>
      </div>
            <template #footer>
        <p class="translate-help">
          {{ $t('settings.translate-help') }}
          <a 
            href="https://translatewiki.net/wiki/Translating:Broomstick" 
            target="_blank" 
            rel="noopener"
            class="translate-link"
          >
            {{ $t('settings.translate-link') }}
          </a>
        </p>
        <div class="footer-buttons">
          <cdx-button  
            @click="showLanguageDialog = false"
            class="cancel-button"
          >
            {{ $t('settings.cancel') }}
          </cdx-button>
          <cdx-button 
            action="progressive" 
            weight="primary" 
            @click="saveLanguage"
          >
            {{ $t('settings.apply') }}
          </cdx-button>
        </div>
      </template>
    </cdx-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
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
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const selectedItem = ref(null);
const currentTheme = ref("auto");
const currentLanguage = ref(locale.value);

const tempTheme = ref("auto");
const tempLanguage = ref(locale.value);

const showThemeDialog = ref(false);
const showLanguageDialog = ref(false);

const themeLabel = computed(() => {
  const labels = {
    auto: t('settings.theme-auto'),
    light: t('settings.theme-light'),
    dark: t('settings.theme-dark'),
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
  // force reactivity on locale change
  locale.value;
  
  return [
    {
      value: "theme",
      label: t('settings.theme-label'),
      description: themeLabel.value,
      icon: effectiveTheme.value === "dark" ? cdxIconMoon : cdxIconBright,
    },
    {
      value: "language",
      label: t('settings.language-label'),
      description: languageLabel.value,
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

function restoreLanguage() {
  const savedLocale = localStorage.getItem('locale');
  if (savedLocale) {
    currentLanguage.value = savedLocale;
    locale.value = savedLocale;
  }
}

const systemTheme = ref(
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
);

onMounted(() => {
  restoreTheme();
  restoreLanguage();

  const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  darkModeQuery.addEventListener("change", (e) => {
    systemTheme.value = e.matches ? "dark" : "light"; // update reactive value
    if (currentTheme.value === "auto") {
      applyTheme("auto");
    }
  });
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
  showLanguageDialog.value = false;
  
  // save to localStorage
  localStorage.setItem('locale', tempLanguage.value);
  
  // switch locale
  locale.value = tempLanguage.value;
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
