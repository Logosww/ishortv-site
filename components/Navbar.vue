<template>
  <header :class="['sv-navbar', scrollY >= 32 ? 'transparent' : '']">
    <div class="sv-navbar-wrapper">
      <div class="sv-navbar-container" v-if="isVideoPage || !auth.isAuthorized">
        <div class="sv-navbar-row">
          <div class="sv-navbar-logo--left" @click="toHomePage"><img :src="`${CDN_URL}/logo.png`" alt="logo"></div>
          <v-btn-toggle v-model="selectedCollection" selected-class="navigation-link active" height="42" mandatory>
            <v-btn value="product" variant="text" rounded="pill" class="navigation-link">成品类</v-btn>
            <v-btn value="material" variant="text" rounded="pill" class="navigation-link">素材类</v-btn>
          </v-btn-toggle>
          <div class="sv-navbar-categories" v-if="isVideoPage">
            <a
              class="sv-navbar-category"
              target="_blank"
              v-for="(item, index) in categories"
              :key="index"
              :href="item.href"
            >
              {{ item.title }}
            </a>
          </div>
        </div>
        <div class="sv-navbar-row">
          <SearchBox v-model="keyword" :center="!isVideoPage" v-if="!hideSearch" />
          <Avatar class="sv-navbar-avatar" />
        </div>
      </div>
      <div class="sv-navbar-container admin" v-else>
        <div class="sv-navbar-row">
          <div class="sv-navbar-logo--left" @click="toHomePage"><img :src="`${CDN_URL}/logo.png`" alt="logo"></div>
          <v-btn class="sv-navbar-btn" rounded="lg" size="large" color="blue-lighten-1" @click="addModalVisible = true">添加视频</v-btn>
          <v-btn class="sv-navbar-btn" rounded="lg" size="large" color="blue-lighten-4" @click="bannerModalVisible = true">轮播管理</v-btn>
          <v-btn-toggle v-model="selectedCollection" selected-class="navigation-link active" height="42" mandatory>
            <v-btn value="product" variant="text" rounded="pill" class="navigation-link">成品类</v-btn>
            <v-btn value="material" variant="text" rounded="pill" class="navigation-link">素材类</v-btn>
          </v-btn-toggle>
          <div class="sv-navbar-categories">
            <a
              v-for="(item, index) in categories"
              :key="index"
              :class="['sv-navbar-category', index === currentIndex ? 'active' : '']"
              @click="navigateTo(`/admin${item.href}`)"
            >
              {{ item.title }}
            </a>
            <div class="sv-navbar-categories__underline" :style="navUnderlineStyle"></div>
          </div>
          <SearchBox v-model="keyword" v-if="!hideSearch" />
        </div>
        <Avatar class="sv-navbar-avatar" />
        <AddVideoModal v-model="addModalVisible" />
        <BannerManagerModal v-model="bannerModalVisible" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { CDN_URL, adminCategories as categories } from '@/constants';

import type { CSSProperties } from 'vue';

const props = defineProps<{ scrollY: number; isVideoPage: boolean, hideSearch?: boolean }>();

const addModalVisible = ref(false);
const bannerModalVisible = ref(false);
const keyword = ref('');

const auth = useAuth();
const selectedCollection = useCollection();
const route = useRoute();

const currentIndex = computed(() => {
  const { category } = route.params;
  let val = category ?? 'all';
  return categories.findIndex(({ value }) => value === val);
});
const navUnderlineStyle = computed<CSSProperties>(() => ({
  transform: `translateX(${ currentIndex.value * 62 }px)`
}))

const toHomePage = async () => {
  const { isAuthorized } = auth.value;
  await navigateTo(
    isAuthorized ? '/admin' : '/',
    { external: props.isVideoPage }
  );
};

</script>

<style lang="scss">
@use '@/assets/style/components/navbar' as *;
</style>