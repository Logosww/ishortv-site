<template>
  <div :class="['sv-search-box', center ? 'center' : '']">
    <div class="sv-search-box__inner">
      <input type="text" class="sv-search-box__input" placeholder="请输入关键字" v-model="keyword" @keydown.enter="handleToSearch">
      <!-- <v-icon class="sv-search-box__clear" :icon="mdi" /> -->
    </div>  
    <v-btn  class="sv-search-box__btn" variant="text" rounded="lg" :max-height="32" :min-width="32" @click="handleToSearch">
      <v-icon :icon="mdiMagnify" />
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { mdiCross, mdiMagnify } from '@mdi/js';

const props = defineProps<{
  modelValue: string;
  center?: boolean, 
  disableNewTab?: boolean
}>();
const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();

const keyword = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
    return val;
  }
});

const handleToSearch = () => 
  navigateTo(`/search?keyword=${keyword.value}`, props.disableNewTab ? undefined : { open: { target: '_blank' } });

</script>

<style lang="scss">
@use '@/assets/style/components/searchbox' as *;
</style>