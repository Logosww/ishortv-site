<template>
  <h2 style="color: #fff; font-size: 22px; line-height: 34px; font-weight: 700; margin-top: 63.48px; margin-bottom: .64em;">推荐视频</h2>
  <div>
    <VideoCard v-for="(item, index) in list" :video-info="item" :key="index" block disable-skeleton />
  </div>
</template>

<script lang="ts" setup>

import type { VideoInfo } from '@/composables/use-api-types';

defineProps<{ list: VideoInfo[] | null }>();
</script>