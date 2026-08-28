<!--
  Broomstick - Lexeme Result Link
  A tool to identify Lexemes on Wikidata that can be improved
  
  @license GPL-2.0-or-later
  @see https://github.com/wikicollabs/broomstick
-->
  
<template>
  <a
    :href="`https://www.wikidata.org/wiki/Lexeme:${lexemeId}`"
    :aria-label="`${isVisited ? $i18n('table-visited-yes') : $i18n('table-visited-no')}, ${lemma}, ${lexemeId}, ${lexicalCategory}`"
    target="_blank"
    rel="noopener"
    class="external-link"
    @click.stop="onClick"
  >
    <span class="link-text">
      <HighlightedText :text="lexemeId" :filter="textFilter" />
    </span>
    <CdxIcon :icon="cdxIconLinkExternal" class="external-icon" />
  </a>
</template>

<script setup>
import { getCurrentInstance } from "vue";
import { CdxIcon } from "@wikimedia/codex";
import { cdxIconLinkExternal } from "@wikimedia/codex-icons";
import HighlightedText from "./HighlightedText.vue";

const instance = getCurrentInstance();
const $i18n = instance?.appContext.config.globalProperties.$i18n;

const props = defineProps({
  lexemeId: {
    type: String,
    required: true,
  },
  lemma: {
    type: String,
    default: "",
  },
  lexicalCategory: {
    type: String,
    default: "",
  },
  isVisited: {
    type: Boolean,
    default: false,
  },
  textFilter: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["visit"]);

function onClick() {
  emit("visit", props.lexemeId);
}
</script>

<style scoped>
.external-link {
  font-weight: 700;
  color: var(--color-progressive);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
}

.external-link:hover {
  text-decoration: underline;
}

.external-icon {
  font-size: 0.875rem;
  color: var(--color-progressive);
}
</style>