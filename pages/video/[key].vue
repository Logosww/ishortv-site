<template>
  <div class="sv-video-page">
    <div class="sv-video-page-container">
      <div class="sv-video-page-container-left">
        <div class="sv-video-title">
          <h1 class="sv-video-title__text">{{ videoInfo?.title }}</h1>
          <div class="sv-video-title__info"></div>
        </div>
        <VideoContent :src="videoUrl!" />
        <div class="sv-video-tags">
          <div class="sv-video-tags__label">标签</div>
          <v-chip
            class="sv-video-tags__item"
            variant="elevated"
            v-for="(tag, index) in videoInfo?.tags"
            :key="index"
            :color="TAG_COLOR_LIST[index % 4]"
          >
            {{ tag }}
          </v-chip>
        </div>
      </div>
      <div class="sv-video-page-container-right">
        <RecommendVideoList :list="videoList" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TAG_COLOR_LIST } from '@/constants';

const { key } = useRoute().params;
const { data: videoUrl } = await useGetVideoUrl(key as string);
const { data: videoInfo } = await useGetVideoInfo(key as string);
const { data: videoList } = await useGetRecommendVideos(key as string);

</script>

<style lang="scss">
@use '@/assets/style/video-page.scss' as *;
</style>