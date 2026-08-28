/**
 * @license GPL-2.0-or-later
 * @see https://github.com/wikicollabs/broomstick
 *
 * URL state sync: reads/writes search state to query params so refresh,
 * back/forward, and shared links work.
 *
 * Deliberately dumb: no validation of language/query values against
 * known-good lists. That's the store's job when it applies the state.
 * This file just moves values between URLSearchParams and plain objects.
 */

import type { AppUrlState, ViewName } from '../types/types'

const VALID_VIEWS: ViewName[] = ['landing', 'search']

function parseView(raw: string | null): ViewName {
  return VALID_VIEWS.includes(raw as ViewName) ? (raw as ViewName) : 'landing'
}

export function readStateFromUrl(): AppUrlState {
  const params = new URLSearchParams(window.location.search)

  return {
    view: parseView(params.get('view')),
    language: params.get('lang'),
    queryId: params.get('query'),
  }
}

export function writeStateToUrl(state: AppUrlState, { replace = false }: { replace?: boolean } = {}) {
  const params = new URLSearchParams()

  if (state.view && state.view !== 'landing') {
    params.set('view', state.view)
  }
  if (state.language) params.set('lang', state.language)
  if (state.queryId) params.set('query', state.queryId)

  const query = params.toString()
  const url = query ? `?${query}` : window.location.pathname

  // no state object passed to pushState/replaceState. single source of
  // truth is the URL itself, re-parsed via readStateFromUrl() on
  // popstate. avoids event.state and the URL drifting out of sync.
  //
  // replace: true for re-searches within the search view (updates url,
  // no new back-stack entry). false (pushState, the default) is for
  // the landing to search transition, so the back button returns to
  // landing once, not through every re-search in between.
  if (replace) {
    history.replaceState(null, '', url)
  } else {
    history.pushState(null, '', url)
  }
}