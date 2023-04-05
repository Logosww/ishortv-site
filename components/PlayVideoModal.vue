<template>
  <v-dialog v-model="modalVisible" scroll-strategy="none" fullscreen>
    <VideoContent 
      :src="src"
      :type="type"
      :title="filename"
      @close-modal="emit('update:modelValue', false)"
      is-modal
    />
  </v-dialog>
</template>

<script setup lang="ts">
import VideoContent from './VideoContent.vue';

const props = defineProps<{ 
  modelValue: boolean;
  src: string;
  type: string;
  filename?: string;
 }>();
const emit = defineEmits(['update:modelValue']);

const modalVisible = computed(() => props.modelValue);
</script>

<style lang="scss">

</style>