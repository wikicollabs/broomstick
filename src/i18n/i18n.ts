/**
 * Broomstick
 * A tool to identify Lexemes on Wikidata that can be improved
 *
 * @license GPL-2.0-or-later
 * @see https://github.com/wikicollabs/broomstick
 */

import { createI18n } from 'vue-banana-i18n';

import { getBrowserLanguage } from './displayLanguages';

const localeModules = import.meta.glob('./*.json', {
    eager: true
}) as Record<
    string,
    { default: Record<string, string> }
>;

const messages: Record<string, Record<string, string>> = {};

for (const [path, module] of Object.entries(localeModules)) {
    const locale = path
        .replace('./', '')
        .replace('.json', '')
        .toLowerCase();

    if (locale !== 'qqq') {
        messages[locale] = module.default;
    }
}

const locale =
    localStorage.getItem('locale') ||
    getBrowserLanguage();

export default createI18n({
    locale,
    messages
});