import { createI18n } from 'vue-banana-i18n'
import enMessages from './en.json'
import idMessages from './id.json'
import { DISPLAY_LANGUAGES } from './displayLanguages.js'

const getBrowserLanguage = () => {
  const browserLang = window?.navigator?.language?.split("-")?.[0];
  const supportedCodes = DISPLAY_LANGUAGES.map(lang => lang.code);
  return supportedCodes.includes(browserLang) ? browserLang : 'en';
};

const messages = {
  en: enMessages,
  id: idMessages
};

export default createI18n({
  locale: localStorage?.getItem('locale') || getBrowserLanguage(),
  messages: messages
});
