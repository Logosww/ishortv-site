<template>
  <div class="sv-search-wrapper">
    <SearchBox class="sv-search-search-box" v-model="keyword" disable-new-tab center />
    <div class="sv-search-filters">
      <div class="sv-search-filter-category">
        <div class="sv-search-filter__label">分类</div>
        <v-btn-toggle theme="dark" variant="outlined" color="blue" v-model="category" rounded="lg" @update:model-value="pagingVideos && (pagingVideos.items = [])" mandatory>
          <v-btn v-for="(category, index) in categories" :key="index" :value="category.value">{{ category.title }}</v-btn>
        </v-btn-toggle>
      </div>
      <div class="sv-search-filter-order">
        <div class="sv-search-filter__label">排序</div>
        <v-btn-toggle theme="dark" variant="outlined" color="blue" v-model="order" @update:model-value="pagingVideos && (pagingVideos.items = [])" mandatory>
          <v-btn :value="0">综合排序</v-btn>
          <v-btn :value="1">最多播放</v-btn>
          <v-btn :value="2">最新发布</v-btn>
        </v-btn-toggle>
      </div>
    </div>
    <div class="sv-search-content">
      <div class="sv-search-content__videos" v-if="pagingVideos?.items.length">
        <VideoCard v-for="(videoInfo, index) in pagingVideos.items" :key="index" :video-info="videoInfo" />
      </div>
      <div class="sv-search-content__empty" v-if="!isLoading && !pagingVideos?.items.length">
        <h2 class="sv-search-content__empty-info">搜索结果为空</h2>
        <img class="sv-search-content__empty-icon" src="https://ggkt-1308682615.cos.ap-shanghai.myqcloud.com/commonishortv/empty.svg">
      </div>
      <transition name="fade">
        <div class="sv-search-content__mask" v-show="isLoading">
          <v-progress-circular color="blue-lighten-1" :size="44" :width="5" indeterminate />
        </div>
      </transition>
      <v-pagination
        v-if="pagingVideos && pagingVideos.totalPage > 1"
        class="sv-search-content__videos-pagination"
        theme="dark"
        color="blue-lighten-3"
        rounded="circle"
        v-model="currentPage"
        :length="pagingVideos?.totalPage"
        @update:model-value="pagingVideos && (pagingVideos.items = [])"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useQueryVideos } from '@/composables/use-api';
import { adminCategories as categories } from '@/constants';

const route = useRoute();

const keyword = ref<string>(route.query.keyword as string);
const category = ref<CategoryType>('all');
const order = ref<0 | 1 | 2>(0);
const currentPage = ref(1);

const queryParams = computed(() => ({
  query: route.query.keyword as string,
  order: order.value,
  category: category.value,
  page: currentPage.value,
  size: 12
}));

const { data: pagingVideos, pending } = await useQueryVideos(queryParams);
const isLoading = useThrottle(pending, 400);
</script>

<style lang="scss">
  @use '@/assets/style/search-page' as *;
</style>