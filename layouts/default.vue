<template>
  <div 
    class="sv-wrapper"
    ref="WrapperRef"
    v-infinite-scroll="() => eventBus.emit('fetch-more')"
    :infinite-scroll-distance="500"
    :infinite-scroll-immediate="false"
  >
    <Navbar :scroll-y="scrollY" :is-video-page="isVideoPage || isSearchPage" :hide-search="isSearchPage" />
    <Categories v-if="!isAuthorized && !isVideoPage && !isSearchPage" />
    <main :class="['sv-section-main', isSearchPage && 'search-page']" v-if="!isAuthorized">
      <Carousel v-if="!isVideoPage && !isSearchPage" />
      <section
        :class="[
          'sv-section-content',
          isVideoPage && 'video-page',
          isSearchPage && 'search-page'
        ]"
      >
        <slot />
      </section>
    </main>
    <main class="sv-section-main admin" v-else>
      <slot />
    </main>
    <footer class="sv-footer">
      <a href="https://beian.miit.gov.cn" target="_blank">豫ICP备2023001996号-1</a>
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
const isVideoPage = /^\/video\//.test(route.path);
const isSearchPage = /^\/search/.test(route.path);

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