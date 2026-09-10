/**
 * Broomstick
 * A tool to identify Lexemes on Wikidata that can be improved
 * 
 * @license GPL-2.0-or-later
 * @see https://github.com/wikicollabs/broomstick
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import i18n from './i18n/i18n'
import { DISPLAY_LANGUAGES, getBrowserLanguage } from './i18n/displayLanguages'
import '@wikimedia/codex-design-tokens/theme-wikimedia-ui.css'
import '@wikimedia/codex/dist/codex.style-bidi.css';


const app = createApp(App);

app.use(createPinia());
app.use(i18n);

app.provide('CdxI18nFunction', (key: string, ...params: unknown[]) => {
  const translatedKeys = [
    'cdx-table-pagination-status-message-determinate-short',
    'cdx-table-pagination-status-message-determinate-long',
    'cdx-table-pager-items-per-page-current',
    'cdx-table-pager-button-first-page',
    'cdx-table-pager-button-last-page',
    'cdx-table-pager-button-next-page',
    'cdx-table-pager-button-prev-page',
    'cdx-dialog-close-button-label'
  ];

  if (!translatedKeys.includes(key)) {
    return key;
  }

  const unwrapRef = (val: unknown) =>
    val && typeof val === 'object' && 'value' in val ? (val as { value: unknown }).value : val;
  const unwrappedParams = params.map(unwrapRef);

  return app.config.globalProperties.$i18n(key, ...unwrappedParams);
});

// storage schema versioning: decoupled from the app release version.
// bump SCHEMA_VERSION only when a stored key's shape or meaning actually
// changes, and add a migration entry for exactly what changed.
const SCHEMA_VERSION = 1;
const SCHEMA_KEY = 'broomstick_storage_schema_version';

type Migration = (storage: Storage) => void;

// keyed by the version being migrated FROM.
const migrations: Record<number, Migration> = {
  0: (storage) => storage.removeItem('broomstick_version'),
};

function runStorageMigrations() {
  const stored = localStorage.getItem(SCHEMA_KEY);
  const storedVersion = stored ? Number(stored) : 0;

  if (Number.isNaN(storedVersion) || storedVersion > SCHEMA_VERSION) {
    localStorage.setItem(SCHEMA_KEY, String(SCHEMA_VERSION));
    return;
  }

  for (let v = storedVersion; v < SCHEMA_VERSION; v++) {
    migrations[v]?.(localStorage);
  }

  localStorage.setItem(SCHEMA_KEY, String(SCHEMA_VERSION));
}

runStorageMigrations();

// apply theme immediately to prevent flash
if (localStorage?.getItem('theme')) {
  const theme = localStorage.getItem('theme')

  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (theme === 'light') {
    document.documentElement.classList.add('light')
  } else if (theme === 'auto') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    }
  }
} else {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark')
  }
}

const savedLocale = localStorage.getItem('locale') || getBrowserLanguage();

const displayLanguage =
  DISPLAY_LANGUAGES.find(language => language.code === savedLocale) ??
  DISPLAY_LANGUAGES.find(
    language => language.code === savedLocale.split('-')[0]
  );

document.documentElement.dir = displayLanguage?.rtl ? 'rtl' : 'ltr';

const savedTextSize = localStorage.getItem('broomstick_text_size') || 'medium';
document.documentElement.setAttribute('font-size', savedTextSize);

app.mount('#app');
