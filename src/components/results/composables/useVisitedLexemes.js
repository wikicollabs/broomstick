/**
 * Broomstick - useVisitedLexemes composable
  A tool to identify Lexemes on Wikidata that can be improved
  
  @license GPL-2.0-or-later
  @see https://github.com/wikicollabs/broomstick
**/

import { ref, computed, watch } from "vue";

const STORAGE_KEY_VISITED = "broomstick_visited";
const STORAGE_KEY_HIDE_VISITED = "broomstick_hide_visited";

/**
 * @param {import('vue').Ref<Array>} results - reactive results list (e.g. toRef(props, 'results'))
 * @param {Function} $i18n - the app's i18n function
 */
export function useVisitedLexemes(results, $i18n) {
  const visitedLexemes = ref(new Set());
  const hideVisited = ref(false);
  const visibilityStatusMessage = ref("");

  function restoreFromStorage() {
    const savedVisited = sessionStorage.getItem(STORAGE_KEY_VISITED);
    if (savedVisited) {
      visitedLexemes.value = new Set(JSON.parse(savedVisited));
    }

    const savedHideVisited = sessionStorage.getItem(STORAGE_KEY_HIDE_VISITED);
    if (savedHideVisited) {
      hideVisited.value = savedHideVisited === "true";
    }
  }

  // save to sessionStorage on changes
  watch(
    visitedLexemes,
    (newSet) => {
      sessionStorage.setItem(STORAGE_KEY_VISITED, JSON.stringify([...newSet]));
    },
    { deep: true }
  );

  watch(hideVisited, (newVal) => {
    sessionStorage.setItem(STORAGE_KEY_HIDE_VISITED, String(newVal));
  });

  const hiddenCount = computed(() => {
    if (!hideVisited.value) return 0;
    return results.value.filter((r) => visitedLexemes.value.has(r.lexemeId)).length;
  });

  const filteredResults = computed(() => {
    if (!hideVisited.value) return results.value;

    const filtered = results.value.filter((r) => {
      const isVisited = visitedLexemes.value.has(r.lexemeId);
      return !isVisited;
    });

    return filtered;
  });

  const allVisitedAndHidden = computed(() => {
    return hideVisited && filteredResults.value.length === 0;
  });

  function markVisited(lexemeId) {
    setTimeout(() => {
      visitedLexemes.value.add(lexemeId);
    }, 100);
  }

  function isVisited(lexemeId) {
    return visitedLexemes.value.has(lexemeId);
  }

  function toggleHideVisited() {
    hideVisited.value = !hideVisited.value;
    if (hideVisited.value) {
      const count = hiddenCount.value;
      visibilityStatusMessage.value = $i18n("table-visibility-hidden-announce", count, count);
    } else {
      visibilityStatusMessage.value = "";
    }
  }

  return {
    visitedLexemes,
    hideVisited,
    visibilityStatusMessage,
    hiddenCount,
    filteredResults,
    allVisitedAndHidden,
    markVisited,
    isVisited,
    toggleHideVisited,
    restoreFromStorage,
  };
}