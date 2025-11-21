import { createI18n } from 'vue-i18n'
import en from './en.json'
import id from './id.json'
import { DISPLAY_LANGUAGES } from './displayLanguages.js'

const getBrowserLanguage = () => {
  const browserLang = window?.navigator?.language?.split("-")?.[0];
  const supportedCodes = DISPLAY_LANGUAGES.map(lang => lang.code);
  return supportedCodes.includes(browserLang) ? browserLang : 'en';
};

const i18n = createI18n({
  legacy: false,
  locale: localStorage?.getItem('locale') || getBrowserLanguage(),
  fallbackLocale: 'en',
  messages: {
    en,
    id
  }
})

export default i18n
