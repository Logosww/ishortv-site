<template>
  <v-dialog v-model="modalVisible" scroll-strategy="none">
    <div class="sv-modal-set-cover">
      <div class="sv-modal-set-cover__header">
        <span class="sv-modal-set-cover__title">设置封面</span>
        <v-btn
          class="sv-modal-set-cover__action" 
          :icon="mdiClose"
          variant="text"
          size="36"
          @click="emit('update:modelValue', false)"
        />
      </div>
      <v-tabs
        color="blue"
        v-model="tab"
      >
        <v-tab value="capture">视频截取</v-tab>
        <v-tab value="upload">本地上传</v-tab>
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item value="capture">
          <VideoContent
            ref="VideoContentRef"
            :src="src"
            :type="type"
            :player-options="options"
            hide-control
          />
          <v-slider 
            v-model="currentTime"
            :label="formattedTimeline"
            @update:model-value="seekTime"
            hide-details
          />
        </v-window-item>
        <v-window-item value="upload">
          <v-img 
            class="sv-set-cover-modal__cover-preview"
            :src="customCover"
            :aspect-ratio="16 / 9"
            width="500"
          >
            <template #placeholder>
              <v-icon :icon="mdiImage" :size="60" />
            </template>
          </v-img>
          <v-file-input
            label="请选择图片"
            accept="image/*"
            variant="underlined"
            :prepend-icon="mdiCamera"
            @update:model-value="handleFileSelected"
            clearable
          />
        </v-window-item>
      </v-window>
      <v-btn
        style="margin-top: 10px;"
        color="blue"
        rounded="pill"
        :prepend-icon="mdiCheckBold"
        :disabled="tab === 'upload' && !customCover"
        width="100"
        height="42"
        @click="handleCapture"
      >
        确定
      </v-btn>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { mdiClose, mdiCheckBold, mdiImage, mdiCamera } from '@mdi/js';
import VideoContent from './VideoContent.vue';


const props = defineProps<{ 
  modelValue: boolean;
  src: string;
  type: string;
  duration: number;
}>();
const emit = defineEmits<{
  (event: 'update:modelValue', visibility: boolean): void;
  (event: 'cover-selected', coverSrc: string): void;
}>();

const tab = ref('capture');
const currentTime = ref(0);
const resolvedTime = ref(0);
const coverSrc = ref('');
const customCover = ref('');
const VideoContentRef = ref<InstanceType<typeof VideoContent>>();
const options = reactive({
  fluid: true,
  autoplay: false
});

const duration = computed(() => props.duration);
const modalVisible = computed(() => props.modelValue);
const VideoElementRef = computed(() => VideoContentRef.value?.VideoRef);
const { formattedTimeline } = useFormatTime(resolvedTime, duration);
const { captureVideoCover } = useCaptureVideo(VideoElementRef);

const seekTime = (val: number) => {
  VideoElementRef!.value!.currentTime 
    = resolvedTime.value
    = val / 100 * duration.value;
};

const handleFileSelected = (files: File[]) => {
  const file = files[0];
  if(file) customCover.value = URL.createObjectURL(file);
  else {
    URL.revokeObjectURL(customCover.value);
    customCover.value = '';
  }
};

const handleCapture = () => {
  if(tab.value === 'capture') {
    coverSrc.value = captureVideoCover();
    resolvedTime.value = currentTime.value = 0;
  }
  else {
    coverSrc.value = customCover.value;
    URL.revokeObjectURL(customCover.value);
    customCover.value = '';
  }
  emitCoverSrc();
};

const emitCoverSrc = () => {
  emit('cover-selected', coverSrc.value);
  emit('update:modelValue', false);
};
</script>

<style lang="scss">
@use '@/assets/style/components/set-cover-modal' as *;
</style>