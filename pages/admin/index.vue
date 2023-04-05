<template>
  <div class="sv-content-body">
    <VideoCard 
      v-for="(item, index) in pagingVideos.items"
      :key="index"
      :video-info="item"
    />
  </div>
</template>

<script setup lang="ts">
import type { ParamsForVideoFetch } from '@/composables/use-api-types';

definePageMeta({
  middleware: 'authorized'
});

const currentCollection = useCollection();
const videoFetchParams = 
  computed(() => ({
    page: 1,
    size: 12,
    categories: [currentCollection.value, 'all'] as ParamsForVideoFetch
  }))
const { data: pagingVideos, refresh } = 
  await useGetAllPagingVideos(videoFetchParams, [currentCollection]);

</script>

<style lang="scss">
@use '@/assets/style/index' as *;
</style>