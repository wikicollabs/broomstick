<!--
  Broomstick - Highlighted Text
  A tool to identify Lexemes on Wikidata that can be improved
  
  @license GPL-2.0-or-later
  @see https://github.com/wikicollabs/broomstick
-->

<template>
  <span v-if="highlighted.matched">{{ highlighted.before }}<span class="highlighted-text">{{ highlighted.matched }}</span>{{ highlighted.after }}</span>
  <span v-else>{{ text }}</span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  filter: {
    type: String,
    default: "",
  },
});

const highlighted = computed(() => {
  if (!props.filter || !props.text) return {};

  const filterLower = props.filter.toLowerCase();
  const textLower = props.text.toLowerCase();
  const index = textLower.indexOf(filterLower);

  if (index === -1) return {};

  const before = props.text.slice(0, index);
  const matched = props.text.slice(index, index + props.filter.length);
  const after = props.text.slice(index + props.filter.length);

  return { before, matched, after };
});
</script>

<style scoped>
.highlighted-text {
  background-color: var(--background-color-progressive-subtle--active);
}
</style>