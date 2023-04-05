<template>
  <span class="sv-content-header">更多视频</span>
  <div class="sv-content-body">
    <VideoCard
      v-for="(item, index) in videos"
      :key="index"
      :video-info="item" 
    />
  </div>
</template>

<script setup lang="ts">
import { eventBusContextKey } from '@/tokens';

import type { CategoryType, ParamsForVideoFetch } from '@/composables/use-api-types';

const eventBus = inject(eventBusContextKey);

const currentCollection = useCollection();
const currentCategory = useRoute().params.category as CategoryType;
const videoFetchParams = 
  computed<ParamsForVideoFetch>(() => [currentCollection.value, currentCategory]);
const { data: videos } = await useGetVideos(videoFetchParams);

eventBus?.on(async e => {
  if(e === 'fetch-more') {
    const moreVideos = await useGetMoreVideos([currentCollection.value, currentCategory]);
    moreVideos.length && videos.value.push(...moreVideos);
  }
});
</script>

<style lang="scss">
@use '@/assets/style/index' as *;
</style>