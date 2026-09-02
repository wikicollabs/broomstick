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

        <!-- Dustpan Information -->
        <div class="divider"></div>

        <div class="dustpan-message">
          <DustpanIcon class="dustpan-icon" aria-hidden="true" />
          <span class="dustpan-content">
            <a
              href="https://dustpan.toolforge.org/"
              target="_blank"
              rel="noopener noreferrer"
              class="dustpan-link"
              :aria-label="$i18n('landing-try-dustpan-link', 'Dustpan')"
            >{{ $i18n('landing-improve-wikiprojects-link', 'Dustpan') }}</a>{{ $i18n('landing-improve-wikiprojects-help') }}
          </span>
        </div>
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
import DustpanIcon from "../components/icons/DustpanIcon.vue";
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
  flex-direction: column;
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

.divider {
  width: 100%;
  padding: 0.25rem 0;
  margin-top: var(--spacing-50);
  margin-bottom: var(--spacing-50);
}

.divider::before {
  content: "";
  display: block;
  border-bottom: 1px solid var(--border-color-base);
}

.dustpan-message {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-50);
  line-height: var(--line-height-medium);
}

.dustpan-content {
  color: var(--color-base);
}

.dustpan-icon {
  width: calc(var(--font-size-medium, 1rem) + 4px);
  height: var(--line-height-medium, 1.625rem);
  flex-shrink: 0;
  color: var(--color-progressive);
}

.dustpan-link {
  color: var(--color-progressive);
  text-decoration: none;
}

.dustpan-link:hover,
.dustpan-link:focus {
  text-decoration: underline;
}

.landing-search-panel {
  width: 100%;
  box-sizing: border-box;
  background-color: var(--background-color-interactive);
  border: 0.0625rem solid var(--border-color-base);
  border-radius: var(--border-radius-base);
  padding: var(--spacing-75);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-75);
}

@media (min-width: 640px) and (max-width: 1023px) {
  .landing-view {
    padding: var(--spacing-200);
  }

  .body-frame {
    justify-content: flex-start;
    gap: var(--spacing-200);
  }

  .section-text,
  .section-form {
    width: 100%;
  }
}

@media (min-width: 1024px) {
  .landing-view {
    padding: var(--spacing-200);
  }

  .body-frame {
    max-width: 56rem;
    flex-direction: row;
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
