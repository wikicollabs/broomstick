/**
 * Broomstick
 * A tool to identify Lexemes on Wikidata that can be improved
 * 
 * @license GPL-2.0-or-later
 * @see https://github.com/wikicollabs/broomstick
 */

export interface DisplayLanguage {
    code: string;
    nativeName: string;
    rtl: boolean;
}

export const DISPLAY_LANGUAGES: DisplayLanguage[] = [
    { code: 'id', nativeName: 'Bahasa Indonesia', rtl: false },
    { code: 'en', nativeName: 'English', rtl: false },
    { code: 'es', nativeName: 'Español', rtl: false },
    { code: 'fr', nativeName: 'Français', rtl: false },
    { code: 'ga', nativeName: 'Gaeilge', rtl: false },
    { code: 'gl', nativeName: 'Galego', rtl: false },
    { code: 'it', nativeName: 'Italiano', rtl: false },
    { code: 'lb', nativeName: 'Lëtzebuergesch', rtl: false },
    { code: 'lt', nativeName: 'Lietuvių', rtl: false },
    { code: 'min', nativeName: 'Minangkabau', rtl: false },
    { code: 'ppl', nativeName: 'Nawat', rtl: false },
    { code: 'nl', nativeName: 'Nederlands', rtl: false },
    { code: 'pms', nativeName: 'Piemontèis', rtl: false },
    { code: 'sk', nativeName: 'Slovenčina', rtl: false },
    { code: 'sv', nativeName: 'Svenska', rtl: false },
    { code: 'mk', nativeName: 'македонски', rtl: false },
    { code: 'sr-ec', nativeName: 'српски (ћирилица)', rtl: false },
    { code: 'he', nativeName: 'עברית', rtl: true },
    { code: 'ps', nativeName: 'پښتو', rtl: true },
    { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', rtl: false },
    { code: 'zh-hans', nativeName: '中文（简体）', rtl: false },
    { code: 'zh-hant', nativeName: '中文（繁體）', rtl: false },
    { code: 'ko', nativeName: '한국어', rtl: false }
];


export const getBrowserLanguage = () => {
  // normalize browser language tag (e.g., 'zh-Hant', 'zh_Hant', 'en-US')
  const browserLang = window?.navigator?.language
    ?.toLowerCase()
    .replace('_', '-'); // normalize underscore to hyphen
 
  if (!browserLang) return 'en';
 
  const supportedCodes = DISPLAY_LANGUAGES.map((lang) => lang.code);
 
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