/**
 * Broomstick
 * A tool to identify Lexemes on Wikidata that can be improved
 * 
 * @license GPL-2.0-or-later
 * @see https://github.com/wikicollabs/broomstick
 */

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import i18n from './i18n'
import '@wikimedia/codex-design-tokens/theme-wikimedia-ui.css'
import '@wikimedia/codex/dist/codex.style-bidi.css';

const app = createApp(App);

app.use(i18n);

app.provide('CdxI18nFunction', (key, ...params) => {
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
  
  const unwrapRef = (val) => val?.value !== undefined ? val.value : val;
  const unwrappedParams = params.map(unwrapRef);
  
  return app.config.globalProperties.$i18n(key, ...unwrappedParams);
});



// version-based localStorage invalidation
const APP_VERSION = '1.7.4';
const storedVersion = localStorage.getItem('broomstick_version');

if (storedVersion !== APP_VERSION) {
  localStorage.clear();
  localStorage.setItem('broomstick_version', APP_VERSION);
}



// apply theme immediately to prevent flash
if (localStorage?.getItem('theme')) {
  const theme = localStorage.getItem('theme')
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (theme === 'light') {
    document.documentElement.classList.add('light')
  }
  else if (theme === 'auto') {
    // check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    }
  }
}

else {
  // no saved preference - check system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark')
  }
}

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ps', 'ur', 'yi'];
const savedLocale = localStorage.getItem('locale') || 'en';
const langCode = savedLocale.split('-')[0];
const isRTL = RTL_LANGUAGES.includes(langCode);

document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

const savedTextSize = localStorage.getItem('broomstick_text_size') || 'medium';
document.documentElement.setAttribute('font-size', savedTextSize);

app.mount('#app');
