/**
 * Broomstick - Query option list builder
 * A tool to identify Lexemes on Wikidata that can be improved
 *
 * @license GPL-2.0-or-later
 * @see https://github.com/wikicollabs/broomstick
 */
import type { Query, QueryOptionGroup } from '../types/types'
import { getAvailableQueriesForLanguage } from './languages'
import { QUERY_GROUPS } from './queries'

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
        .map((query: Query) => ({
          value: query.value,
          label: `queries-${query.value}`,
          ...(query.params ? { params: query.params } : {}),
        })),
    }))
    .filter((group) => group.items.length > 0)
}