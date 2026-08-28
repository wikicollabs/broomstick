/**
 * @license GPL-2.0-or-later
 * @see https://github.com/wikicollabs/broomstick
 */

// --- language ---

export interface Language {
  display: string
  code: string
  autonym: string
  qid: string
}

// --- query ---

// builds the final SPARQL string for a given language.
// NOTE: this function-embedded shape reflects queries.js as it exists today.
// story 2 moves SPARQL bodies to standalone files; Query's shape will
// likely drop this field once that lands.
export type SparqlFn = (languageQid: string, languageCode: string) => string

export interface Query {
  value: string
  label: string
  languages: string[] | null // null = available to all languages
  sparql: SparqlFn
}

export interface QueryGroup {
  group: string
  queries: Query[]
}

// shape returned by getQueryOptionsForLanguage, consumed by CdxCombobox.
// distinct from QueryGroup: label/items here are i18n message keys, not raw query data.
export interface QueryOption {
  value: string
  label: string // i18n message key
  params?: string[]
}

export interface QueryOptionGroup {
  label: string // i18n message key
  items: QueryOption[]
}

// --- result ---

export interface LexemeResult {
  lexemeId: string
  lemma: string
  lexicalCategory: string
}

// standard W3C SPARQL 1.1 JSON Results binding value shape
// (https://www.w3.org/TR/sparql11-results-json/) — one bound variable's
// value within a single result row.
export interface SparqlBindingValue {
  type: 'uri' | 'literal' | 'bnode'
  value: string
  'xml:lang'?: string
  datatype?: string
}

// --- state ---

// search selection state — scope matches what story 4's Pinia store
// is expected to own (selected language + query, and the values
// captured at the moment a search actually runs).
export interface SearchSelectionState {
  selectedLanguage: string // Language.display, used as lookup key — see note near Language
  selectedGapType: string  // Query.value
  searchedLanguage: string
  searchedGapType: string
}

// results + status for the most recent search execution
export interface SearchResultsState {
  results: LexemeResult[]
  isLoading: boolean
  error: string | null
  connectionError: boolean
}