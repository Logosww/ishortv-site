<template>
  <div :class="['sv-search-box', center ? 'center' : '']">
    <input type="text" class="sv-search-box__input" placeholder="请输入关键字">  
    <v-btn  class="sv-search-box__btn" variant="text" rounded="lg" :max-height="32" :min-width="32">
      <v-icon :icon="mdiMagnify" />
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { mdiMagnify } from '@mdi/js';

defineProps<{ center?: boolean }>();

</script>

<style lang="scss">
@use '@/assets/style/components/searchbox' as *;
</style>