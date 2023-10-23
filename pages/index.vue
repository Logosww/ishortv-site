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

import type { ParamsForVideoFetch } from '@/composables/use-api-types';

const eventBus = inject(eventBusContextKey);

let lastId = 0, isMore = true;
const currentCollection = useCollection();
const videoFetchParams = 
  computed(() => ({
    categories: [currentCollection.value, 'recommend'] as ParamsForVideoFetch,
    lastId: 0
  }));
const { data: videos } = await useGetVideos(videoFetchParams);
lastId = videos.value?.length ? videos.value.at(-1)!.id : 0;

const unsubscribe = eventBus?.on(async e => {
  if(e === 'fetch-more') {
    if(!isMore) return;
    const moreVideos = await useGetMoreVideos({
      lastId,
      categories: videoFetchParams.value.categories
    });
    moreVideos.length
      ? (lastId = moreVideos.at(-1)!.id) && videos.value?.push(...moreVideos)
      : isMore = false;
  }
});

onUnmounted(() => unsubscribe?.());
</script>

<style lang="scss">
@use '@/assets/style/index' as *;
</style>