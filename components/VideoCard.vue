<template>
  <div class="sv-video-card">
    <div class="sv-video-card__cover">
      <a :href="`/video/${videoInfo.videoKey}`" target="_blank">
        <v-img :src="videoInfo.coverUrl" :aspect-ratio="16 / 9" cover />
      </a>
    </div>
    <span class="sv-video-card__title">
      <a :href="`/video/${videoInfo.videoKey}`" target="_blank">
        {{ videoInfo.title }}
      </a>
    </span>
  </div>
</template>

<script setup lang="ts">
import { VideoInfo } from '@/composables/use-api-types';

defineProps<{ videoInfo: VideoInfo }>();
</script>

<style lang="scss">
@use '@/assets/style/components/video-card' as *;
</style>