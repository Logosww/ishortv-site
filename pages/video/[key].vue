<template>
  <div class="sv-video-page">
    <div class="sv-video-page-container">
      <div class="sv-video-page-container-left">
        <div class="sv-video-title">
          <h1 class="sv-video-title__text">这是一个视频标题。</h1>
          <div class="sv-video-title__info"></div>
        </div>
        <VideoContent :src="videoUrl" />

      </div>
      <div class="sv-video-page-container-right"></div>
    </div>
  </div>
</template>

<script setup lang="ts">

const { key } = useRoute().params;
const { data: videoUrl } = await useGetVideoUrl(key as string);


</script>

<style lang="scss">
@use '@/assets/style/video-page.scss' as *;
</style>