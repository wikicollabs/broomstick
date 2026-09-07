export const DISPLAY_LANGUAGES = [
  { code: 'id', nativeName: 'Bahasa Indonesia' },
  { code: 'en', nativeName: 'English' },
  { code: 'es', nativeName: 'Español' },
  { code: 'fr', nativeName: 'Français' },
  { code: 'ga', nativeName: 'Gaeilge' },
  { code: 'gl', nativeName: 'Galego' },
  { code: 'lb', nativeName: 'Lëtzebuergesch' },
  { code: 'lt', nativeName: 'Lietuvių' },
  { code: 'min', nativeName: 'Minangkabau' },
  { code: 'ppl', nativeName: 'Nawat' },
  { code: 'nl', nativeName: 'Nederlands' },
  { code: 'pms', nativeName: 'Piemontèis' },
  { code: 'sk', nativeName: 'Slovenčina' },
  { code: 'sv', nativeName: 'Svenska' },
  { code: 'mk', nativeName: 'македонски' },
  { code: 'sr-ec', nativeName: 'српски (ћирилица)' },
  { code: 'he', nativeName: 'עברית '},
  { code: 'ps', nativeName: 'پښتو' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'zh-hans', nativeName: '中文（简体）' },
  { code: 'zh-hant', nativeName: '中文（繁體)' },
  { code: 'ko', nativeName: '한국어' }
]

export const getBrowserLanguage = () => {
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