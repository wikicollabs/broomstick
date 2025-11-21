<!--
  Broomstick - App Header
  A tool to identify Lexemes on Wikidata that can be improved
  
  @license GPL-2.0-or-later
  @see https://github.com/wikicollabs/broomstick
-->

<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <BroomstickLogo
          class="header-logo"
          alt="broomstick"
          tabindex="0"
          role="button"
          @click="$emit('home')"
          @keydown.enter="$emit('home')"
          @keydown.space.prevent="$emit('home')"
          style="cursor: pointer"
        />
      </div>
      <settings-menu />
    </div>
  </header>
</template>

<script setup>
import SettingsMenu from "./SettingsMenu.vue";
import BroomstickLogo from "./BroomstickLogo.vue";
const emit = defineEmits(["home"]);
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--background-color-base);
  border-bottom: 0.0625rem solid var(--border-color-base);
  height: 3.375rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-50) var(--spacing-75) var(--spacing-50)
    var(--spacing-100);
}

@media (min-width: 640px) {
  .app-header {
    height: 4rem;
    padding: var(--spacing-75) var(--spacing-200);
  }
}

.header-content {
  display: flex;
  width: 100%; /* make it fill the header */
  justify-content: space-between;
  align-items: center;
  /* REMOVED padding and height - not needed */
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-50);
}

.header-logo {
  width: 10.625rem;
  height: 2.25rem;
  cursor: pointer;
  color: #3056a9;
}
</style>
