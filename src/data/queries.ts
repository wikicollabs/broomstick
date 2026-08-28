/**
 * Broomstick - List of supported queries
 * A tool to identify Lexemes on Wikidata that can be improved
 *
 * @license GPL-2.0-or-later
 * @see https://github.com/wikicollabs/broomstick
 */

import type { QueryGroup, QueryOptionGroup } from '../types/types'

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

export const QUERY_GROUPS: QueryGroup[] = [
  {
    group: "General",
    queries: [
      {
        value: "is-empty",
        label: "is empty",
        languages: null, // null = all languages
      },
      {
        value: "missing-senses",
        label: "has no Senses",
        languages: null,
      },
      {
        value: "missing-forms",
        label: "has no Forms",
        languages: null,
      },
      {
        value: "missing-external-identifiers",
        label: "has no external identifiers",
        languages: null,
      },
      {
        value: "missing-usage-example",
        label: "is missing usage example (P5831)",
        languages: null,
      },
    ],
  },
  {
    group: "Senses",
    queries: [
      {
        value: "missing-item-for-sense",
        label: "is missing item for this sense (P5137), demonym of (P6271), or hyperonym (P6593)",
        languages: null,
      },
      {
        value: "missing-predicate-troponym",
        label: "is missing predicate for (P9970) or troponym of (P5975)",
        languages: null,
      },
    ],
  },
  {
    group: "Forms",
    queries: [
      {
        value: "missing-grammatical-features",
        label: "has no grammatical features",
        languages: null,
      },
      {
        value: "missing-ipa",
        label: "is missing IPA transcription (P898)",
        languages: null,
      },
      {
        value: "missing-pronunciation-audio",
        label: "is missing pronunciation audio (P443)",
        languages: null,
      },
    ],
  },
  {
    group: "Misplacements",
    queries: [
      {
        value: "misplaced-item-for-sense",
        label: "misplaced the item for this sense (P5137) at the Lexeme level instead of on the Senses level",
        languages: null,
      },
    ],
  },
  {
    group: "Language-specific",
    queries: [
      // to be implemented later
    ],
  },
];

export function getQueryOptionsForLanguage(language: string | null): QueryOptionGroup[] {
  // just return message keys, not translations
  const allLanguagesQueries: QueryOptionGroup[] = [
    {
      label: 'queries-general',
      items: [
        { value: 'is-empty', label: 'queries-is-empty' },
        { value: 'missing-senses', label: 'queries-missing-senses' },
        { value: 'missing-forms', label: 'queries-missing-forms' },
        { value: 'missing-external-identifiers', label: 'queries-missing-external-identifiers' },
        { value: 'missing-usage-example', label: 'queries-missing-usage-example', params: ['(P5831)']  }
      ]
    },
    {
      label: 'queries-senses',
      items: [
        { value: 'missing-item-for-sense', label: 'queries-missing-item-for-sense', params: ['(P5137)', '(P6271)', '(P6593)'] },
        { value: 'missing-predicate-troponym', label: 'queries-missing-predicate-troponym', params: ['(P9970)', '(P5975)']  }
      ]
    },
    {
      label: 'queries-forms',
      items: [
        { value: 'missing-ipa', label: 'queries-missing-ipa', params: ['(P898)']  },
        { value: 'missing-pronunciation-audio', label: 'queries-missing-pronunciation-audio', params: ['(P443)']  },
        { value: 'missing-grammatical-features', label: 'queries-missing-grammatical-features' }
      ]
    },
    {
      label: 'queries-misplacements',
      items: [
        { value: 'misplaced-item-for-sense', label: 'queries-misplaced-item-for-sense', params: ['(P5137)']  }
      ]
    }
  ];

  return allLanguagesQueries;
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