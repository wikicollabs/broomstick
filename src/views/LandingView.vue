<!--
  Broomstick - Landing View
  A tool to identify Lexemes on Wikidata that can be improved
  
  @license GPL-2.0-or-later
  @see https://github.com/wikicollabs/broomstick
-->

<template>
  <div class="landing-view">
    <div class="body-frame">
      <section class="section-text">
        <h1>{{ $i18n('broomstick-tagline') }}</h1>
        <p class="subtitle">{{ $i18n('broomstick-subtitle') }}</p>
      </section>
      <section class="section-form">
        <div class="landing-search-panel">
          <SearchForm
            v-model:language="selectedLanguage"
            v-model:gapType="selectedGapType"
            :disabled="isLoading"
            @search="executeSearch"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { getCurrentInstance } from "vue";
import SearchForm from "../components/SearchForm.vue";
import { useSearchStore } from "../state/searchStore";
import { storeToRefs } from "pinia";

const instance = getCurrentInstance();
const $i18n = instance?.appContext.config.globalProperties.$i18n;

const store = useSearchStore();
const { selectedLanguage, selectedGapType, isLoading } = storeToRefs(store);

async function executeSearch() {
  await store.executeSearch();
}
</script>

<style scoped>
/* MOBILE FIRST */
.landing-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-100);
  flex: 1;
}

.body-frame {
  width: 100%;
  max-width: calc(100vw - 2 * var(--spacing-100)); 
  display: flex;
  flex-direction: column; /* stack vertically on mobile */
  gap: var(--spacing-100); 
}

.section-text {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.section-form {
  width: 100%;
}

.landing-view h1 {
  font-family: var(--font-family-serif);
  font-size: 2rem;
  font-weight: 400;
  line-height: 1.25;
  color: var(--color-emphasized);
  margin: 0 0 var(--spacing-50) 0;
}

.subtitle {
  color: var(--color-subtle);
  margin: 0;
}

.landing-search-panel {
  width: 100%;
  box-sizing: border-box; /* includes padding/border in width */
  background-color: var(--background-color-interactive);
  border: 0.0625rem solid var(--border-color-base);
  border-radius: var(--border-radius-base);
  padding: var(--spacing-75);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-75);
}


/* LANDING VIEW - TABLET PORTRAIT */
@media (min-width: 640px) and (max-width: 1023px) {
  .landing-view {
    padding: var(--spacing-200); /* 32px padding */
  }

  .body-frame {
    justify-content: flex-start; /* top-align instead of center */
    gap: var(--spacing-200); /* 32px between h1 section and search panel */
  }
  
  .section-text {
    width: 100%;
  }
  
  .section-form {
    width: 100%;
  }
  
}


/* LANDING VIEW - DESKTOP */
@media (min-width: 1024px) {
  .landing-view {
    padding: var(--spacing-200); 
  }

  .body-frame {
    max-width: 56rem; 
    flex-direction: row; /* side-by-side */
    gap: var(--spacing-150); 
  }

  .section-text {
    width: 30rem; 
  }

  .section-form {
    width: 24rem; 
  }

}
</style>
