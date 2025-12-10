import { createI18n } from 'vue-banana-i18n'
import enMessages from './en.json'
import idMessages from './id.json'
import lbMessages from './lb.json'
import pmsMessages from './pms.json'
import zhhantMessages from './zh-hant.json'

import { DISPLAY_LANGUAGES } from './displayLanguages.js'

const getBrowserLanguage = () => {
  // normalize browser language tag (e.g., 'zh-Hant', 'zh_Hant', 'en-US')
  const browserLang = window?.navigator?.language
    ?.toLowerCase()
    .replace('_', '-'); // normalize underscore to hyphen
  
  if (!browserLang) return 'en';
  
  const supportedCodes = DISPLAY_LANGUAGES.map(lang => lang.code);
  
  // first try exact match (e.g., 'zh-hant')
  if (supportedCodes.includes(browserLang)) {
    return browserLang;
  }
  
  // then try base language code (e.g., 'zh' from 'zh-hant')
  const baseLang = browserLang.split('-')[0];
  if (supportedCodes.includes(baseLang)) {
    return baseLang;
  }
  
  // fallback to English
  return 'en';
};

const messages = {
  en: enMessages,
  id: idMessages,
  lb: lbMessages,
  pms: pmsMessages,
  'zh-hant':zhhantMessages
};

export default createI18n({
  locale: localStorage?.getItem('locale') || getBrowserLanguage(),
  messages: messages
});
