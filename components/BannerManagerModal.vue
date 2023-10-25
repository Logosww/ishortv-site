<template>
  <v-dialog v-model="modalVisible" scroll-strategy="none">
    <div class="sv-modal-banner-manager">
      <div class="sv-modal-banner-manager__header">
        <div class="sv-modal-banner-manager__title">轮播管理</div>
        <v-btn 
          class="sv-modal-banner-manager__action"
          :icon="mdiClose"
          variant="text"
          color="white"
          size="32"
          @click="modalVisible = false"
        />
      </div>
      <div class="sv-modal-banner-manager__content">
        <div class="sv-modal-banner-manager__filter">
          <v-switch
            class="sv-modal-banner-manager__collection"
            v-model="currentCollection"
            :label="currentCollection === 'material' ? '素材类' : '成品类'"
            true-value="material"
            false-value="product"
            color="#03A9F4"
            hide-details
            inset
          />
          <v-select
            class="sv-modal-banner-manager__category"
            label="分类"
            :items="categories"
            bg-color="rgba(255, 255, 255, .3)"
            color="#03A9F4"
            density="comfortable"
            theme="dark"
            v-model="currentCategory"
          />
        </div>
        <v-table class="sv-modal-banner-manager__table" theme="dark">
          <thead>
            <tr>
              <th>
                标题
              </th>
              <th>
                封面大图物料（若未上传指定，默认为原视频封面）
              </th>
              <th>
                <v-btn 
                  rounded="lg" 
                  color="blue-lighten-1" 
                  :prepend-icon="mdiPlus" 
                  :disabled="!!bannerVideos && bannerVideos.length >= 5" 
                  @click="handleToSelectVideo"
                >
                  添加视频
                </v-btn>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(video, index) in bannerVideos"
              :key="index"
            >
              <td>
                <div class="sv-modal-banner-manager__table-item__title">{{ video.title }}</div>
              </td>
              <td>
                <div :class="['sv-modal-banner-manager__banner-cover', uploadingQueue.includes(video.id) && 'is-uploading']">
                  <v-img :aspect-ratio="16 / 9" :src="video.bannerCoverUrl || video.coverUrl" cover />
                  <div class="sv-modal-banner-manager__banner-cover__mask">
                    <v-progress-circular v-show="uploadingQueue.includes(video.id)" indeterminate />
                    <v-btn variant="tonal" :icon="mdiImageEditOutline" v-show="!uploadingQueue.includes(video.id)" @click="() => handleUploadCover(index)" />
                  </div>
                </div>
              </td>
              <td>
                <v-btn rounded="lg" color="red-accent-2" :prepend-icon="mdiDeleteOutline" @click="() => handleDeleteBannerVideo(index)">删除</v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </v-dialog>
  <v-dialog v-model="videosModalVisible">
    <div class="sv-modal-banner-manager">
      <div class="sv-modal-banner-manager__header">
        <div class="sv-modal-banner-manager__title">选择视频</div>
        <v-btn 
          class="sv-modal-banner-manager__action"
          :icon="mdiClose"
          variant="text"
          color="white"
          size="32"
          @click="videosModalVisible = false"
        />
      </div>
      <div class="sv-modal-banner-manager__videos-wrapper">
        <v-item-group v-model="selectedVideoIndex" mandatory>
          <div 
            class="sv-modal-banner-manager__videos-list" 
            v-infinite-scroll="handleFetchMoreVideos"
            :infinite-scroll-distance="500"
            :infinite-scroll-immediate="false"
          >
            <v-item #default="{ isSelected, toggle }" v-for="(video, index) in videos" :key="index">
              <div :class="['sv-modal-banner-manager__videos-item', isSelected && 'is-selected']" @click="toggle">
                <div class="sv-modal-banner-manager__videos-item__cover">
                  <v-img :src="video.coverUrl" cover />
                  <div class="sv-modal-banner-manager__videos-item__mask"><v-icon :icon="mdiCheckCircle" /></div>
                </div>
                <div class="sv-modal-banner-manager__videos-item__title">{{ video.title }}</div>
              </div>
            </v-item>
          </div>
        </v-item-group>
      </div>
      <div class="sv-modal-banner-manager__footer">
        <v-btn 
          rounded="lg"
          color="blue-lighten-1"
          :loading="isSubmitting"
          :prepend-icon="mdiCheck"
          :disabled="selectedVideoIndex < 0"
          @click="handleSubmit"
        >
          确认
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { mdiClose, mdiPlus, mdiCheck, mdiCheckCircle, mdiImageEditOutline, mdiDeleteOutline } from '@mdi/js';
import { categories } from '@/constants';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);

let lastId = 0, isMore = true;

const isSubmitting = ref(false);
const videosModalVisible = ref(false);
const currentCategory = ref<CategoryType>('recommend');
const currentCollection = ref<CollectionType>('product');
const selectedVideoIndex = ref<number>(-1);
const uploadingQueue = ref<number[]>([]);

const modalVisible = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
    return val;
  }
});
const videoFecthParams = computed<ParamsForVideoFetch>(() => [currentCollection.value, currentCategory.value]);
const wrappedVideoFetchParams = computed(() => ({ categories: videoFecthParams.value, lastId: 0 }));

const { data: bannerVideos, refresh: refreshBannerVideos } = await useGetBannerVideos(videoFecthParams, { deep: true });
const { data: videos, refresh: refreshVideos } = await useAdminGetVideos(wrappedVideoFetchParams, { immediate: false });

const message = useMessage();
const { upload } = await useCOSUpload();

const handleToSelectVideo = () => {
  refreshVideos();
  selectedVideoIndex.value = -1;
  videosModalVisible.value = true;
};

const handleFetchMoreVideos = async () => {
  if(!isMore) return;
  const moreVideos = await useGetMoreVideos({ 
    lastId,
    categories: videoFecthParams.value
  });
  
  moreVideos.length
      ? (lastId = moreVideos.at(-1)!.id) && videos.value?.push(...moreVideos)
      : isMore = false;
};

const handleSubmit = () => {
  isSubmitting.value = true;
  const { id: selectedVideoId } = videos.value![selectedVideoIndex.value!];
  useSetBannerVideo(selectedVideoId).then(async () => {
    await refreshBannerVideos();
    message({ type: 'success', message: '添加成功' });
    videosModalVisible.value = false;
  }).finally(() => isSubmitting.value = false);
};

const handleUploadCover = (index: number) => {
  const { id } = bannerVideos.value![index];
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.png,.jpg,.jpeg,.webp';
  input.onchange = () => {
    const [image] = input.files!;
    const src = URL.createObjectURL(image);
    bannerVideos.value![index].bannerCoverUrl = src;
    uploadingQueue.value.push(id);
    upload(image).then(async (key) => {
      await useSetBannerVideoCover({ id, bannerCoverKey: key });
      const index = uploadingQueue.value.findIndex(vid => vid === id);
      uploadingQueue.value.splice(index, 1);
      URL.revokeObjectURL(src);
      message({ type:'success', message: '封面上传成功'})
    });
  };
  input.click();
};

const handleDeleteBannerVideo = (index: number) => {
  const { id } = bannerVideos.value![index];
  useDeleteBannerVideo(id).then(() => {
    bannerVideos.value!.splice(index, 1);
    message({ type: 'success', message: '删除成功' });
  });
};
</script>

<style lang="scss">
  @use '@/assets/style/components/banner-manager-modal' as *;
</style>