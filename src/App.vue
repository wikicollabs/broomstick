<!--
  Broomstick - Main App Component
  A tool to identify Lexemes on Wikidata that can be improved
  
  @license GPL-2.0-or-later
  @see https://github.com/wikicollabs/broomstick
-->

<template>
  <div class="app">
    <CdxToastContainer />

    <AppHeader @home="store.goHome()" ref="headerRef" />

    <main class="main-content">
      <LandingView v-if="currentView === 'landing'" />
      <SearchView v-else-if="currentView === 'search'" />
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import { CdxToastContainer, useToast } from "@wikimedia/codex";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import LandingView from "./views/LandingView.vue";
import SearchView from "./views/SearchView.vue";
import { useSearchStore } from "./state/searchStore";
import { storeToRefs } from "pinia";

const instance = getCurrentInstance();
const $i18n = instance?.appContext.config.globalProperties.$i18n;

const toast = useToast();

const store = useSearchStore();
const { currentView } = storeToRefs(store);

const headerRef = ref(null);

// call restore on mount
onMounted(() => {
  store.restoreLastSearch(); // restore from localStorage first
  store.restoreFromUrl(); // then check url params and override if present

  window.addEventListener('popstate', store.handlePopState);

  // check for language change toast
  const toastLang = localStorage.getItem('language_change_toast');
    if (toastLang) {
      toast.show({
        message: $i18n('settings-language-changed', toastLang),
        type: 'success',
        preventUserDismiss: true,
        autoDismiss: true,
      });
      localStorage.removeItem('language_change_toast');
    }
});
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color-base);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
