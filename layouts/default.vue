<template>
  <div 
    class="sv-wrapper"
    ref="WrapperRef"
    v-infinite-scroll="() => eventBus.emit('fetch-more')"
    :infinite-scroll-distance="500"
    :infinite-scroll-immediate="false"
  >
    <Navbar :scroll-y="scrollY" :is-video-page="isVideoPage" />
    <Categories v-if="!isAuthorized && !isVideoPage" />
    <main class="sv-section-main" v-if="!isAuthorized">
      <Carousel v-if="!isVideoPage" />
      <section
        :class="[
          'sv-section-content',
          isVideoPage ? 'video-page' : ''
        ]"
      >
        <slot />
      </section>
    </main>
    <main class="sv-section-main admin" v-else>
      <slot />
    </main>
    <footer class="sv-footer">
      <a href=" " target="_blank">豫ICP备2023001996号-1</a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { 
  eventBusKey,
  categoryKey,
  eventBusContextKey 
} from '@/tokens';

import type { CategoryType } from '@/composables/use-api-types';

const auth = useAuth();
const { isAuthorized } = auth.value;

const WrapperRef = ref<HTMLDivElement>();
const { y: scrollY } = useScroll(WrapperRef);

const route = useRoute();
const isVideoPage = /\/video\//.test(route.path);
const currentCategory = computed(() => 
  (
    route.params.category
    ?? (isAuthorized ? undefined : 'recommend')
  ) as CategoryType
);

const eventBus = useEventBus(eventBusKey);
provide(eventBusContextKey, eventBus);
provide(categoryKey, currentCategory);

</script>

<style lang="scss">
@use '@/assets/style/layout' as *;
</style>