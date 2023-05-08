<template>
  <div class="app">
    <NuxtLayout>
      <NuxtLoadingIndicator />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script setup>
import { CDN_URL } from '@/constants';
import 'normalize.css';

useHead({
  // titleTemplate: (titleChunck) => titleChunck ? `${titleChunck} | iShortV` : 'iShortV',
  title: '我的学习经验分享',
  link: [
    {
      rel: 'icon',
      href: `${CDN_URL}/logo@favicon.png`
    }
  ],
  meta: [{
    
  }]
});
</script>
<style lang="scss">
@use '@/assets/style/scrollbar' as *;

html {
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  overflow-y: hidden;
}

body {
  font-family: $font-family;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
