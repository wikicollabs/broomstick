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
import '@wikimedia/codex/dist/codex.style.css'


const app = createApp(App);

app.provide('CdxI18nFunction', (key, ...params) => {
  
  // Codex keys we use for translating
  const translatedKeys = [
    'cdx-table-pagination-status-message-determinate-short',
    'cdx-table-pagination-status-message-determinate-long',
    'cdx-table-pager-items-per-page-current',
    'cdx-table-pager-button-first-page',
    'cdx-table-pager-button-last-page',
    'cdx-table-pager-button-next-page',
    'cdx-table-pager-button-prev-page'
  ];
  
  // if it's not a key we care about, return empty string or key itself
  // this prevents warnings for keys we're intentionally not translating
  if (!translatedKeys.includes(key)) {
    return key; 
  }
  
  const unwrapRef = (val) => val?.value !== undefined ? val.value : val;
  
  if (key.includes('pagination-status')) {
    return i18n.global.t(key, { 
      x: unwrapRef(params[0]),
      y: unwrapRef(params[1]),
      z: unwrapRef(params[2])
    });
  } else if (key.includes('items-per-page')) {
    return i18n.global.t(key, { 
      current: unwrapRef(params[0])
    });
  }
  
  return i18n.global.t(key);
});

// version-based localStorage invalidation
const APP_VERSION = '1.1.1';
const storedVersion = localStorage.getItem('broomstick_version');

if (storedVersion !== APP_VERSION) {
  localStorage.clear();
  localStorage.setItem('broomstick_version', APP_VERSION);
  console.log(`localStorage cleared - version updated to ${APP_VERSION}`);
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


app.use(i18n).mount('#app')
