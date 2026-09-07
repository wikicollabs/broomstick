/**
 * @license GPL-2.0-or-later
 * @see https://github.com/wikicollabs/broomstick
 *
 * Search store: owns the current view, selected lexeme language and
 * query type, search execution, and results.
 *
 * URL sync lives in urlState.ts, kept dumb and separate. This store
 * decides what state means (which language a code maps to, whether a
 * search should re-run), urlState.ts just moves values in and out of
 * the query string.
 *
 * Deliberately does not own filter state (text filter, category
 * filter). Those stay local to App.vue, they're ephemeral to the
 * results view and don't need to be shared or restored.
 *
 * Deliberately does not own i18n. errors are stored as i18n message
 * keys, not translated text, so the component translates them at
 * display time and stays correct if the interface language changes
 * mid-error-state.
 */
import { defineStore } from 'pinia'
import { getLanguageQid, getLanguageCode, LANGUAGES } from '../data/languages'
import { getQuerySparql } from '../data/queries'
import { readStateFromUrl, writeStateToUrl } from './urlState'
import type { LexemeResult, ViewName } from '../types/types'

interface LexemeSparqlBinding {
  lexeme: { value: string }
  lemma: { value: string }
  lexicalCategory?: { value: string }
  lexicalCategoryLabel?: { value: string }
}

interface LexemeSparqlResponse {
  results: { bindings: LexemeSparqlBinding[] }
}

export const useSearchStore = defineStore('search', {
  state: () => ({
    currentView: 'landing' as ViewName,
    selectedLanguage: 'English (en)',
    selectedGapType: 'is-empty',
    searchedLanguage: 'English (en)',
    searchedGapType: 'is-empty',
    isLoading: false,
    error: null as string | null,
    connectionError: false,
    results: [] as LexemeResult[],
  }),
  actions: {
    goHome() {
      this.currentView = 'landing'
      writeStateToUrl({ view: 'landing', language: null, queryId: null })
    },
    saveLastSearch() {
      localStorage.setItem('broomstick_last_language', this.selectedLanguage)
      localStorage.setItem('broomstick_last_query', this.selectedGapType)
    },
    restoreLastSearch() {
      const savedLanguage = localStorage.getItem('broomstick_last_language')
      const savedQuery = localStorage.getItem('broomstick_last_query')
      if (savedLanguage) this.selectedLanguage = savedLanguage
      if (savedQuery) this.selectedGapType = savedQuery
    },
    // applies whatever the URL says right now, on mount. runs a search
    // if the URL points at one. does not push a new history entry,
    // the URL is already there, this just makes the app match it.
    restoreFromUrl() {
      this.applyUrlState(readStateFromUrl())
    },
    // called from App.vue's popstate listener when the user navigates
    // back/forward. same idea as restoreFromUrl, different trigger.
    handlePopState() {
      this.applyUrlState(readStateFromUrl())
    },
    applyUrlState(state: ReturnType<typeof readStateFromUrl>) {
      this.currentView = state.view
      if (state.view !== 'search' || !state.language || !state.queryId) {
        this.results = []
        return
      }
      const langObj = LANGUAGES.find((l) => l.code === state.language)
      if (!langObj) return
      this.selectedLanguage = langObj.display
      this.selectedGapType = state.queryId
      this.runQuery()
    },
    // user-initiated search: writes the new url state, then runs it.
    // replace: true when re-searching from an already-open results
    // view, so repeated searches don't pile up back-stack entries.
    async executeSearch() {
      const languageCode = getLanguageCode(this.selectedLanguage)
      if (!languageCode) {
        this.error = 'errors-language-not-found'
        return
      }
      writeStateToUrl(
        { view: 'search', language: languageCode, queryId: this.selectedGapType },
        { replace: this.currentView === 'search' }
      )
      this.currentView = 'search'
      await this.runQuery()
    },
    // shared fetch + parse logic, used by executeSearch and by url
    // restoration (mount and popstate). does not touch the URL itself.
    async runQuery() {
      const languageQid = getLanguageQid(this.selectedLanguage)
      const languageCode = getLanguageCode(this.selectedLanguage)

      if (!languageQid || !languageCode) {
        this.error = 'errors-language-not-found'
        return
      }

      const querySparql = getQuerySparql(this.selectedGapType, languageQid, languageCode)

      if (!querySparql) {
        this.error = 'errors-query-not-found'
        return
      }

      this.searchedLanguage = this.selectedLanguage
      this.searchedGapType = this.selectedGapType
      this.saveLastSearch()

      this.error = null
      this.connectionError = false
      this.isLoading = true
      this.results = []

      try {
        const response = await fetch('https://query.wikidata.org/sparql', {
          method: 'POST',
          headers: {
            Accept: 'application/sparql-results+json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `query=${encodeURIComponent(querySparql)}`,
        })

        if (!response.ok) {
          throw new Error('Query failed')
        }

        const data: LexemeSparqlResponse = await response.json()

        const lexemeMap = new Map<string, { lexemeId: string; lemmas: string[]; lexicalCategory: string }>()

        data.results.bindings.forEach((binding) => {
          const lexemeId = binding.lexeme.value.split('/').pop() ?? binding.lexeme.value
          const lemma = binding.lemma.value
          const categoryLabel = binding.lexicalCategoryLabel?.value || ''
          const categoryQid = binding.lexicalCategory?.value.split('/').pop() || ''
          const lexicalCategory = categoryQid ? `${categoryLabel} (${categoryQid})` : categoryLabel

          const existing = lexemeMap.get(lexemeId)
          if (existing) {
            if (!existing.lemmas.includes(lemma)) {
              existing.lemmas.push(lemma)
            }
          } else {
            lexemeMap.set(lexemeId, { lexemeId, lemmas: [lemma], lexicalCategory })
          }
        })

        this.results = Array.from(lexemeMap.values()).map((item) => ({
          lexemeId: item.lexemeId,
          lemma: item.lemmas.join(' / '),
          lexicalCategory: item.lexicalCategory,
        }))
      } catch (err) {
        console.error('Query error:', err)
        this.connectionError = true
      } finally {
        this.isLoading = false
      }
    },
  },
})