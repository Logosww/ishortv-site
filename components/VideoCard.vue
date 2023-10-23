<template>
  <div class="sv-video-card-wrapper">
    <div :class="['sv-video-card-skeleton', !isLoading && 'is-hidden']" v-if="!disableSkeleton">
      <div class="sv-video-card-skeleton__cover">
        <v-skeleton-loader theme="dark" height="100%" type="image" loading />
      </div>
      <div class="sv-video-card-skeleton__title">
        <v-skeleton-loader theme="dark" width="100%" type="list-item-two-line" loading />
      </div>
    </div>
    <div :class="['sv-video-card', block ? 'is-block' : '', isLoading && !disableSkeleton && 'is-hidden']">
      <div class="sv-video-card__cover">
        <a :href="`/video/${videoInfo.videoKey}`" target="_blank">
          <img class="sv-video-card__cover-original" :src="videoInfo.coverUrl" object-fit="cover" @load="handleLoaded" />
        </a>
        <div class="sv-video-card__cover-duration">{{ videoInfo.duration }}</div>
      </div>
      <span class="sv-video-card__title">
        <a :href="`/video/${videoInfo.videoKey}`" target="_blank">
          {{ videoInfo.title }}
        </a>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VSkeletonLoader } from 'vuetify/lib/labs/VSkeletonLoader/index.mjs';

defineProps<{ 
  videoInfo: VideoInfo;
  block?: boolean;
  disableSkeleton?: boolean;
}>();

const isLoading = ref(true);

const handleLoaded = () => setTimeout(() => isLoading.value = false, 450);
</script>

<style lang="scss">
@use '@/assets/style/components/video-card' as *;
</style>