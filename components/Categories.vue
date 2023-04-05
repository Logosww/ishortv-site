<template>
  <aside class="sv-sidebar-categories">
    <a
      v-for="(item, index) in categories"
      :key="index"
      :class="['sv-sidebar-category', item.value === currentCategory ? 'active' : '']"
      @click="handleCategoryClick(item.href)"
    >
      {{ item.title }}
    </a>
  </aside>
</template>

<script setup lang="ts">
import { categories } from '@/constants';
import { categoryKey } from '@/tokens';

const currentCategory = inject(categoryKey)!;

const handleCategoryClick = async (href: string) => {
  await navigateTo(href);
};
</script>

<style lang="scss">
@use '@/assets/style/components/categories' as *;
</style>