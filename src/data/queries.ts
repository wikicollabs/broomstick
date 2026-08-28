/**
 * Broomstick - List of supported queries
 * A tool to identify Lexemes on Wikidata that can be improved
 *
 * @license GPL-2.0-or-later
 * @see https://github.com/wikicollabs/broomstick
 */

import type { QueryGroup, QueryOptionGroup } from '../types/types'

export const QUERY_GROUPS: QueryGroup[] = [
  {
    group: "General",
    queries: [
      {
        value: "is-empty",
        label: "is empty",
        languages: null, // null = all languages
        sparql: (languageQid, languageCode) => `
          SELECT ?lexeme ?lemma ?lexicalCategory ?lexicalCategoryLabel WHERE {
            ?lexeme dct:language wd:${languageQid} ;
                    wikibase:lemma ?lemma;
                    wikibase:lexicalCategory ?lexicalCategory.
            FILTER NOT EXISTS { ?lexeme ontolex:lexicalForm ?form }
            FILTER NOT EXISTS { ?lexeme ontolex:sense ?sense }
            ?lexeme wikibase:statements 0 .
            SERVICE wikibase:label { bd:serviceParam wikibase:language "${languageCode},mul,en". }
          }
        `,
      },
      {
        value: "missing-senses",
        label: "has no Senses",
        languages: null,
        sparql: (languageQid, languageCode) => `
          SELECT ?lexeme ?lemma ?lexicalCategory ?lexicalCategoryLabel WHERE {
            ?lexeme dct:language wd:${languageQid} ;
                    wikibase:lemma ?lemma ;
                    wikibase:lexicalCategory ?lexicalCategory.
            FILTER NOT EXISTS { ?lexeme ontolex:sense ?sense }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "${languageCode},mul,en". }
          }
        `,
      },
      {
        value: "missing-forms",
        label: "has no Forms",
        languages: null,
        sparql: (languageQid, languageCode) => `
          SELECT ?lexeme ?lemma ?lexicalCategory ?lexicalCategoryLabel WHERE {
            ?lexeme dct:language wd:${languageQid} ;
                    wikibase:lemma ?lemma ;
                    wikibase:lexicalCategory ?lexicalCategory.
            FILTER NOT EXISTS { ?lexeme ontolex:lexicalForm ?form }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "${languageCode},mul,en". }
          }
        `,
      },
      {
        value: "missing-external-identifiers",
        label: "has no external identifiers",
        languages: null,
        sparql: (languageQid, languageCode) => `
SELECT ?lexeme ?lemma ?lexicalCategory ?lexicalCategoryLabel WHERE {
  ?lexeme dct:language wd:${languageQid} ;
          wikibase:lemma ?lemma;
  wikibase:lexicalCategory ?lexicalCategory.

  FILTER NOT EXISTS {
    ?lexeme ?p ?val.
    ?prop wikibase:directClaim ?p ;
          wikibase:propertyType wikibase:ExternalId.
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${languageCode},mul,en". }
}
        `,
      },
      {
        value: "missing-usage-example",
        label: "is missing usage example (P5831)",
        languages: null,
        sparql: (languageQid, languageCode) => `
          SELECT ?lexeme ?lemma ?lexicalCategory ?lexicalCategoryLabel WHERE {
            ?lexeme dct:language wd:${languageQid} ;
                    wikibase:lemma ?lemma ;
                  wikibase:lexicalCategory ?lexicalCategory.
            FILTER NOT EXISTS { ?lexeme wdt:P5831 ?example }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "${languageCode},mul,en". }

          }
        `,
      },
    ],
  },
  {
    group: "Senses",
    queries: [
      {
        value:
          "missing-item-for-sense",
        label:
          "is missing item for this sense (P5137), demonym of (P6271), or hyperonym (P6593)",
        languages: null,
        sparql: (languageQid, languageCode) => `
          SELECT ?lexeme ?lemma ?lexicalCategory ?lexicalCategoryLabel WHERE {
            ?lexeme dct:language wd:${languageQid};
                    wikibase:lemma ?lemma ;
                    wikibase:lexicalCategory wd:Q1084;
                    ontolex:sense ?sense .
           BIND(wd:Q1084 AS ?lexicalCategory)
              FILTER NOT EXISTS {
    ?lexeme ontolex:sense ?sense2.
    ?sense2 wdt:P5137|wdt:P6271|wdt:P6593 ?anyItem.
  }
SERVICE wikibase:label { bd:serviceParam wikibase:language "${languageCode},mul,en". }
          }
        `,
      },
      {
        value: "missing-predicate-troponym",
        label: "is missing predicate for (P9970) or troponym of (P5975)",
        languages: null,
        sparql: (languageQid, languageCode) => `
          SELECT ?lexeme ?lemma ?lexicalCategory ?lexicalCategoryLabel WHERE {
            ?lexeme dct:language wd:${languageQid};
                    wikibase:lemma ?lemma ;
                    wikibase:lexicalCategory wd:Q24905;
                    ontolex:sense ?sense .
           BIND(wd:Q24905 AS ?lexicalCategory)
              FILTER NOT EXISTS {
    ?lexeme ontolex:sense ?sense2.
    ?sense2 wdt:P9970|wdt:P5975 ?anyPredicate.
  }
SERVICE wikibase:label { bd:serviceParam wikibase:language "${languageCode},mul,en". }
          }
        `,
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
        sparql: (languageQid, languageCode) => `
          SELECT ?lexeme ?lemma ?lexicalCategory ?lexicalCategoryLabel WHERE {
            ?lexeme dct:language wd:${languageQid} ;
                    wikibase:lemma ?lemma ;
                  wikibase:lexicalCategory ?lexicalCategory;
                    ontolex:lexicalForm ?form .
            FILTER NOT EXISTS { ?form wikibase:grammaticalFeature ?feature }
SERVICE wikibase:label { bd:serviceParam wikibase:language "${languageCode},mul,en". }
          }
        `,
      },
      {
        value: "missing-ipa",
        label: "is missing IPA transcription (P898)",
        languages: null,
        sparql: (languageQid, languageCode) => `
SELECT DISTINCT ?lexeme ?lemma ?lexicalCategory ?lexicalCategoryLabel WHERE {
  ?lexeme dct:language wd:${languageQid};
          wikibase:lemma ?lemma ;
          wikibase:lexicalCategory ?lexicalCategory ;
          ontolex:lexicalForm ?form.

  FILTER NOT EXISTS {
    ?lexeme ontolex:lexicalForm ?form2.
    ?form2 wdt:P898 ?transcription .
  }

  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "${languageCode},mul,en" .
  }
}

        `,
      },
      {
        value: "missing-pronunciation-audio",
        label: "is missing pronunciation audio (P443)",
        languages: null,
        sparql: (languageQid, languageCode) => `
SELECT ?lexeme ?lemma ?lexicalCategory ?lexicalCategoryLabel WHERE {
  ?lexeme dct:language wd:${languageQid};
          wikibase:lemma ?lemma ;
          wikibase:lexicalCategory ?lexicalCategory ;
          ontolex:lexicalForm ?form.

  FILTER NOT EXISTS {
    ?lexeme ontolex:lexicalForm ?form2.
    ?form2 wdt:P443 ?audio .
  }

  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "${languageCode},mul,en" .
  }
}
        `,
      },
    ],
  },
  {
    group: "Misplacements",
    queries: [
      {
        value:
          "misplaced-item-for-sense",
        label:
          "misplaced the item for this sense (P5137) at the Lexeme level instead of on the Senses level",
        languages: null,
        sparql: (languageQid, languageCode) => `
SELECT ?lexeme ?lemma ?lexicalCategory ?lexicalCategoryLabel WHERE {
  ?lexeme dct:language wd:${languageQid};
          wikibase:lemma ?lemma ;
          wikibase:lexicalCategory ?lexicalCategory ;
          wdt:P5137 ?senseItem .

  FILTER NOT EXISTS {
    ?lexeme ontolex:sense ?sense .
    ?sense wdt:P5137 ?validUse .
  }

  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "${languageCode},mul,en" .
  }
}
        `,
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

/*
// get queries filtered by selected language, returns grouped format for CdxCombobox
export function getQueryOptionsForLanguage(selectedLanguage) {
  if (!selectedLanguage) return [];

  return QUERY_GROUPS.map((group) => ({
    label: group.group,
    items: group.queries
      .filter((q) => !q.languages || q.languages.includes(selectedLanguage))
      .map((q) => ({
        value: q.value,
        label: q.label,
      })),
  })).filter((group) => group.items.length > 0); // remove empty groups
}
*/
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


// get sparql by query value
export function getQuerySparql(queryValue: string, languageQid: string, languageCode: string): string | null {
  for (const group of QUERY_GROUPS) {
    const query = group.queries.find((q) => q.value === queryValue);
    if (query) return query.sparql(languageQid, languageCode);
  }
  return null;
}

// get all query values as flat array (for validation)
export function getAllQueryValues(): string[] {
  return QUERY_GROUPS.flatMap((group) => group.queries.map((q) => q.value));
}