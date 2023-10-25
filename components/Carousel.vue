<template>
  <div class="sv-category-carousel-wrapper">
    <div class="sv-category-carousel" v-if="recommendation?.length">
      <div class="sv-carousel-cover">
        <img
          v-for="(item, index) in recommendation"
          :class="[
            'sv-carousel-cover__img',
            index === currentCarouselIndex ? '' : 'hide'
          ]"
          :key="index"
          :src="item.bannerCoverUrl || item.coverUrl"
        >
        <a 
          class="sv-carousel-cover__mask"
          :href="`/video/${currentCarouselItem?.videoKey}`"
          target="_blank"
        >
          <div class="sv-carousel-cover__mask-left"></div>
          <div class="sv-carousel-cover__mask-right"></div>
          <div class="sv-carousel-cover__mask-top"></div>
          <div class="sv-carousel-cover__mask-bottom"></div>
        </a>
      </div>
      <div class="sv-carousel-thumbnails">
        <div class="sv-carousel-title">{{ currentCarouselItem?.title }}</div>
        <div
          v-for="(item, index) in recommendation" :key="index"
          :class="[
              'sv-carousel-thumbnail',
              currentCarouselIndex === index ? 'active' : '',
              frozenCarouselIndex === index ? 'frozen' : ''
            ]"
        >
          <div class="sv-carousel-thumbnail__border"></div>
          <div class="sv-carousel-thumbnail__content">
            <a :href="`/video/${item.videoKey}`" target="_blank">
              <img
                :aspect-ratio="16 / 9"
                :src="item.coverUrl"
                @mouseenter="handleThumbMouseEnter(index)"
                @mouseleave="handleThumbMouseLeave"
              >
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { categoryKey } from '@/tokens';

import type { ParamsForVideoFetch } from '@/composables/use-api-types';

const currentCarouselIndex = ref(0);
const frozenCarouselIndex = ref<number>();

const currentCarouselItem = computed(
  () => recommendation.value?.[currentCarouselIndex.value]
);

const currentCollection = useCollection();
const currentCategory = inject(categoryKey)!; 

const videoFecthParams = 
  computed<ParamsForVideoFetch>(() => [currentCollection.value, currentCategory.value]);
  
const { data: recommendation } = await useGetBannerVideos(videoFecthParams);

const { start: startTimer, stop: stopTimer } = useTimeoutFn(() => {
  if(!recommendation.value) return;
  currentCarouselIndex.value = (currentCarouselIndex.value + 1) % (recommendation.value?.length);
  startTimer();
}, 5000);

const handleThumbMouseEnter = (index: number) => {
  currentCarouselIndex.value = index;
  frozenCarouselIndex.value = index;
  stopTimer();
};

const handleThumbMouseLeave = () => {
  frozenCarouselIndex.value = undefined;
  startTimer();
};

watch(
  () => videoFecthParams.value,
  () => currentCarouselIndex.value = 0
);

</script>

<style lang="scss">
@use '@/assets/style/components/carousel' as *;
</style>