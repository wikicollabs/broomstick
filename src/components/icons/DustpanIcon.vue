<!--
  SPDX-License-Identifier: GPL-2.0-or-later

  Broomstick
  A tool to uncover Lexemes that can be improved on Wikidata
  @see https://github.com/wikicollabs/broomstick
-->

<template>
  <svg
    v-bind="$attrs"
    width="18"
    height="18"
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path
        d="M42.667 245.333V512H512V128C512 57.308 454.692 0 384 0H0v202.667l42.667 42.666Z"
        fill="#196551"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M320 224H144L96 416v32h277.333L448 384v-96c0-35.346-28.654-64-64-64V64h-32l-32 160Zm23.016 48c20.818 0 36.092 19.564 31.044 39.761L352 400h-32l19.2-80H224l-80 80 32-128h167.016Z"
        fill="var(--background-color-base)"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});
</script>