<template>
  <v-dialog v-model="modalVisible" scroll-strategy="none">
    <div class="sv-modal-add-video">
      <div class="sv-modal-add-video__header">
        <span class="sv-modal-add-video__title">新增视频描述</span>
        <!-- <div class="sv-modal-add-video__action">
          <v-icon :icon="mdiCloseThick" />
        </div> -->
        <v-btn 
          class="sv-modal-add-video__action"
          :icon="mdiClose"
          variant="text"
          color="white"
          size="32"
          @click="handleClose"
        />
      </div>
      <input 
        ref="FileInputRef"
        type="file"
        accept=".mp4,.flv,.avi,.wmv,.mov,.webm,.mpeg4,.ts,.mpg,.rm,.rmvb,.mkv,.m4v"
        @click.stop
        @change="handleChange"
      />
      <div
        :class="['sv-modal-add-video__upload', isOverDropZone ? 'active' : '']"
        ref="UploadBtnRef"
        @click="FileInputRef?.click()"
        v-if="!isFileSelected"
        v-ripple
      >
        <v-icon :icon="mdiCloudUpload" size="70" />
        <span>拖拽文件到这里或者点击上传</span>
      </div>
      <div class="sv-modal-add-video__content" v-else>
        <div class="sv-modal-add-video__upload-progress">
          <v-progress-linear
            v-model="uploadProgress"
            color="green-accent-4"
            height="20"
            rounded
            striped
          >
          <template #default="{ value }">
            <strong style="font-size: 14px; color: #111;">{{ Math.ceil(value) }}%</strong>
          </template>
          </v-progress-linear>
          <span class="sv-modal-add-video__upload-progress__detail">{{ uploadingDetail }}</span>
        </div>
        <div class="sv-modal-add-video__content-left">
          <div>
            <div class="sv-modal-add-video__video" @click="handlePlayVideo">
              <v-img 
                :aspect-ratio="16 / 9"
                :src="coverBase64"
                cover
              />
              <div class="sv-modal-add-video__video-mask">
                <div class="sv-modal-add-video__video-mask__overlay">
                  <v-icon :icon="mdiPlayCircle" />
                </div>
                <span class="sv-modal-add-video__video-mask__length">16.23</span>
              </div>
            </div>
            <div class="sv-modal-add-video-row">
              <v-btn rounded="lg" color="blue" :prepend-icon="mdiPlayCircle" :disabled="!isUploaded" @click="handlePlayVideo">播放</v-btn>
              <v-btn rounded="lg" color="red-lighten-1" :prepend-icon="mdiRefresh" :disabled="!isUploaded" @click="handleReset">更换视频</v-btn>
            </div>
            <v-img
              class="sv-modal-add-video__cover"
              :src="customCover || coverBase64"
              :aspect-ratio="16 / 9"
              cover
            />
            <div class="sv-modal-add-video-row">
              <v-btn rounded="lg" color="blue" :prepend-icon="mdiPencil" width="210" :disabled="!isUploaded" @click="setCoverModalVisible = true">设置封面</v-btn>
            </div>
          </div>
        </div>
        <div class="sv-modal-add-video__content-right">
          <v-form :disabled="!isUploaded">
            <v-text-field label="标题" v-model="form.title" placeholder="请输入" />
            <v-select label="内容种类" :items="categories" v-model="form.category"  />
            <v-select label="类别" :items="collections" v-model="form.collection" />
            <div class="form-item">
              <div style="margin-bottom: 10px;">标签</div>
              <v-btn class="tag-input-btn" 
                :icon="mdiPlus"
                height="32"
                width="32"
                variant="text"
                v-show="!tagInputVisible"
                :disabled="!isUploaded"
                @click="tagInputVisible = true"
              />
              <v-text-field 
                label="按 Enter 确认"
                class="tag-input"
                v-if="tagInputVisible"
                v-model="tagInputValue"
                @keyup.enter="handleTagComfirm"
                @blur="handleTagComfirm"
                autofocus
              />
              <v-chip-group class="tags" v-show="!tagInputVisible">
                <v-chip 
                  v-for="(item, index) in form.tags" 
                  :key="index"
                  closable
                  @click:close="handleTagDelete(index)"
                >
                  {{ item }}
                </v-chip>
              </v-chip-group>
            </div>
          </v-form>
          <div class="sv-modal-add-video-row">
            <v-btn
              rounded="lg"
              color="blue"
              width="210"
              :prepend-icon="mdiCheckBold"
              :disabled="!isUploaded"
              @click="handleAddVideo"
            >
              确认新增
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </v-dialog>
  <PlayVideoModal
    v-model="playModalVisible"
    :src="videoSrc"
    :type="videoType"
    :filename="videoFilename"
  />
  <SetCoverModal 
    :src="videoSrc"
    :type="videoType"
    :duration="videoDuration"
    v-model="setCoverModalVisible"
    @cover-selected="handleReceiveCover"
  />
</template>

<script setup lang="ts">
import { 
  mdiClose,
  mdiCloudUpload,
  mdiCheckBold,
  mdiPlayCircle,
  mdiRefresh,
  mdiPencil,
  mdiPlus
} from '@mdi/js';
import { base64ToFile } from '@/utils/file';
import prettyBytes from 'pretty-bytes';
import PlayVideoModal from './PlayVideoModal.vue';
import { uploadCategories as categories } from '@/constants';

import type { VTextField } from 'vuetify/components';
import type { CategoryType, CollectionType } from '@/composables/use-api-types';

interface FormData {
  title: string;
  category: CategoryType;
  collection: CollectionType;
  tags: string[];
  videoKey: string;
  coverKey: string;
};
interface Option {
  title: string;
  value: string;
};

const form = reactive<FormData>({
  title: '',
  category: undefined,
  collection: undefined,
  tags: [],
  videoKey: '',
  coverKey: ''
});
const collections: Option[] = [
  {
    title: '成品类',
    value: 'product'
  },
  {
    title: '素材类',
    value: 'material'
  }
];

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);

const SUPPORTED_FILE_TYPE = [
  'mp4',
  'flv',
  'avi',
  'wmv',
  'mov',
  'webm',
  'mpeg4',
  'ts',
  'mpg',
  'rm',
  'rmvb',
  'mkv',
  'm4v'
];

const coverBase64 = ref('');
const customCover = ref('');
const videoSrc = ref('');
const videoType = ref('');
const videoFilename = ref('');
const videoDuration = ref(0);

const isFileSelected = ref(false);
const isUploaded = ref(false);
const uploadProgress = ref(0);
const uploadSpeed = ref(0);
const uploadedBytes = ref(0);
const fileSize = ref('');
const uploadingDetail = ref('');
const modalVisible = computed(() => props.modelValue);
const FileInputRef = shallowRef<HTMLInputElement>();
const UploadBtnRef = ref<HTMLDivElement>();

const playModalVisible = ref(false);
const setCoverModalVisible = ref(false);
const tagInputVisible = ref(false);
const tagInputValue = ref('');

const onFileDrop = (files: File[] | null) => {
  const rawFile = files?.length && files[0];
  if(rawFile) upload(rawFile);
};

const message = useMessage();
const { isOverDropZone } = useDropZone(UploadBtnRef, onFileDrop);

const convertBytes = (bytes: number, decimal = 1) =>
  prettyBytes(bytes, { maximumFractionDigits: decimal });

const upload = (rawFile: File) => {
  if(isUploaded.value) isUploaded.value = false;

  const extension = rawFile.name.split('.').slice(-1)[0];
  if(!SUPPORTED_FILE_TYPE.includes(extension)) {
    message({
      type: 'danger',
      message: '不支持的文件类型'
    });
    return;
  }
  doUpload(rawFile);
};

const { upload: uploadFile } = await useCOSUpload((progressData) => {
  const { percent, speed, loaded } = progressData;
  uploadProgress.value = percent * 100;
  uploadSpeed.value = speed;
  uploadedBytes.value = loaded;
  uploadingDetail.value = `${convertBytes(loaded)} / ${fileSize.value} ${convertBytes(speed, 2)}/s`;
});

const doUpload = async (rawFile: File) => {
  if(!isFileSelected.value) isFileSelected.value = true;
  uploadProgress.value = 0;
  fileSize.value = convertBytes(rawFile.size);
  const key = await uploadFile(rawFile);
  if(!key) {
    message({ type: 'danger', message: '文件上传失败' });
    return;
  }
  form.videoKey = key;

  // get cover after upload.
  FileInputRef.value!.value = '';
  if(videoSrc.value) URL.revokeObjectURL(videoSrc.value);
  videoFilename.value = rawFile.name;
  const { imageSrc, videoUrl, duration } = await getVideoCover(rawFile);
  coverBase64.value = imageSrc;
  videoSrc.value = videoUrl;
  videoType.value = rawFile.type;
  videoDuration.value = duration;
  isUploaded.value = true;
};

const getVideoCover = (file: File) => {
  return new Promise<{ 
    imageSrc: string; 
    videoUrl: string;
    duration: number;
  }>
  ((resolve, reject) => {
    const video = document.createElement('video');
    const { captureVideoCover } = useCaptureVideo(video);
    const videoUrl = URL.createObjectURL(file);
    video.preload = 'auto';
    video.src = videoUrl;
    video.addEventListener('loadeddata', () => {
      const imageSrc = captureVideoCover();
      const { duration } = video;
      resolve({ imageSrc, videoUrl, duration });
    });
    video.addEventListener('error', (e) => {
      URL.revokeObjectURL(videoUrl);
      reject(e);
    });
  });
} 


const handleChange = () => {
  const { files } = FileInputRef.value!;
  if(files?.length) {
    upload(files[0])
  }
};

const handleClose = () => {
  emit('update:modelValue', false);
  setTimeout(() => {
    isFileSelected.value = false;
    FileInputRef.value!.value = '';
    URL.revokeObjectURL(videoSrc.value);
  }, 100); 
};

const handleTagComfirm = () => {
  if(tagInputValue.value) form.tags.push(tagInputValue.value);
  tagInputVisible.value = false;
  tagInputValue.value = '';
};

const handleTagDelete = (index: number) => {
  form.tags.splice(index, 1);
};

const handlePlayVideo = () => {
  playModalVisible.value = true;
};

const handleReset = () => {
  FileInputRef.value!.value = '';
  FileInputRef.value!.click();
};

const handleReceiveCover = (coverSrc: string) => {
  coverBase64.value = coverSrc;
};

const handleAddVideo = async () => {
  const image = base64ToFile(coverBase64.value);
  const key = await uploadFile(image);
  if(!key) {
    message({ type: 'danger', message: '封面上传失败' });
    return;
  }
  form.coverKey = key;
  const isSucceed = await useAddVideo({
    title: form.title,
    coverKey: form.coverKey,
    videoKey: form.videoKey,
    tags: form.tags,
    categories: [ form.collection!, form.category! ]
  });
  if(!isSucceed) message({ type: 'danger', message: '添加视频失败，请重试' });
  else {
    message({ type: 'success', message: '添加视频成功' });
    handleClose();
  }
};

</script>

<style lang="scss">
@use '@/assets/style/components/add-video-modal' as *;
</style>