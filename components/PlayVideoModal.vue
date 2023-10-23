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

const modalVisible = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
    return val;
  }
});
</script>

<style lang="scss">

</style>