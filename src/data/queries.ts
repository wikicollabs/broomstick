/**
 * Broomstick - List of supported queries
 * A tool to identify Lexemes on Wikidata that can be improved
 *
 * @license GPL-2.0-or-later
 * @see https://github.com/wikicollabs/broomstick
 */

import type { QueryGroup, QueryOptionGroup } from '../types/types'
import { getAvailableQueriesForLanguage } from './languages'

// raw SPARQL bodies live as standalone .rq files under src/queries/,
// one per query value, filename matching the value string exactly.
// keys come back as full relative paths (e.g. "../queries/is-empty.rq"),
// so they're normalized to bare values below for lookup by query value.
const sparqlFiles = import.meta.glob('../queries/*.rq', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

const sparqlByValue: Record<string, string> = {}
for (const path in sparqlFiles) {
  const value = path.replace('../queries/', '').replace('.rq', '')
  sparqlByValue[value] = sparqlFiles[path]
}

// query metadata only. readable labels and group names live as i18n
// message keys, derived from value/group below, not stored here.
export const QUERY_GROUPS: QueryGroup[] = [
  {
    group: "General",
    queries: [
      { value: "is-empty" },
      { value: "missing-senses" },
      { value: "missing-forms" },
      { value: "missing-external-identifiers" },
      { value: "missing-usage-example", params: ["(P5831)"] },
    ],
  },
  {
    group: "Senses",
    queries: [
      { value: "missing-item-for-sense", params: ["(P5137)", "(P6271)", "(P6593)"] },
      { value: "missing-predicate-troponym", params: ["(P9970)", "(P5975)"] },
    ],
  },
  {
    group: "Forms",
    queries: [
      { value: "missing-grammatical-features" },
      { value: "missing-ipa", params: ["(P898)"] },
      { value: "missing-pronunciation-audio", params: ["(P443)"] },
    ],
  },
  {
    group: "Misplacements",
    queries: [
      { value: "misplaced-item-for-sense", params: ["(P5137)"] },
    ],
  },
  {
    group: "Language-specific",
    queries: [
      // to be implemented later
    ],
  },
];

// builds the option list for a given language's display string, deriving
// group/item labels as i18n message keys from QUERY_GROUPS. groups with
// no available items for this language are dropped entirely.
export function getQueryOptionsForLanguage(language: string | null): QueryOptionGroup[] {
  const availableValues = language ? getAvailableQueriesForLanguage(language) : []

  return QUERY_GROUPS
    .map((group) => ({
      label: `queries-${group.group.toLowerCase()}`,
      items: group.queries
        .filter((query) => availableValues.includes(query.value))
        .map((query) => ({
          value: query.value,
          label: `queries-${query.value}`,
          ...(query.params ? { params: query.params } : {}),
        })),
    }))
    .filter((group) => group.items.length > 0);
}

// get sparql by query value, with language placeholders substituted in
export function getQuerySparql(queryValue: string, languageQid: string, languageCode: string): string | null {
  const template = sparqlByValue[queryValue]
  if (!template) return null

  return template
    .replace(/%LANGUAGE_QID%/g, languageQid)
    .replace(/%LANGUAGE_CODE%/g, languageCode)
}

// get all query values as flat array (for validation)
export function getAllQueryValues(): string[] {
  return QUERY_GROUPS.flatMap((group) => group.queries.map((q) => q.value));
}