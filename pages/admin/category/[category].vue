<template>
  <div class="sv-content-body">
    <VideoCard 
      v-for="(item, index) in pagingVideos?.items"
      :key="index"
      :video-info="item"
    />
    <transition name="fade">
      <div class="sv-content-body__mask" v-show="isLoading">
        <v-progress-circular color="blue-lighten-1" :size="44" :width="5" indeterminate />
      </div>
    </transition>
  </div>
  <v-pagination
    v-if="pagingVideos && pagingVideos.totalPage > 1"
    class="sv-videos-pagination"
    theme="dark"
    color="blue-lighten-3"
    rounded="circle"
    v-model="currentPage"
    :length="pagingVideos?.totalPage"
    @update:model-value="pagingVideos && (pagingVideos.items = [])"
  />
</template>

<script setup lang="ts">

import type { CategoryType, ParamsForVideoFetch } from '@/composables/use-api-types';

definePageMeta({
  middleware: 'authorized'
});

const currentPage = ref(1);
const currentCollection = useCollection();
const currentCategory = useRoute().params.category as CategoryType;
const videoFetchParams = 
  computed(() => ({
    size: 12,
    page: currentPage.value,
    categories: [currentCollection.value, currentCategory] as ParamsForVideoFetch
  }))
const { data: pagingVideos, pending: isLoading } = await useGetAllPagingVideos(videoFetchParams);

</script>
