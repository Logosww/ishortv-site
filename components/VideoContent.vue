<template>
  <div 
    :class="['sv-video-wrapper', isModal ? 'is-modal' : '']"
    :style="{ width: `${width}px`, height: `${height}px` }"
  >
    <div class="sv-video-container">
      <video
        class="sv-video__original video-js"
        id="sv-video__original"
        ref="VideoRef"
        preload="auto"
        :src="src"
        :type="type"
        :autoplay="playerOptions?.autoplay ?? true"
      >
      </video>
    </div>
    <VideoOverlay
      ref="VideoOverlayRef"
      :player="player!"
      :is-modal="isModal"
      :title="title"
      @close-modal="emit('close-modal')"
      autoplay
      v-if="!hideControl && isSetup"
    />
  </div>
</template>

<script setup lang="ts">
import videojs from 'video.js';
import VideoOverlay from './VideoOverlay.vue';

import 'video.js/dist/video-js.css';

export type Player = ReturnType<typeof videojs>;

const props = defineProps<{ 
  src: string; 
  type?: string;
  isModal?: boolean;
  width?: number;
  height?: number;
  title?: string;
  cover?: string;
  hideControl?: boolean;
  playerOptions?: object;
}>();

const emit = defineEmits(['close-modal']);

const isSetup = ref(false);
const player = ref<Player>();
const VideoRef = ref<HTMLVideoElement>();
const VideoOverlayRef = ref<InstanceType<typeof VideoOverlay>>();

const defaultPlayerOptions = {
  fill: true
};
const playerOptions: any = Object.assign(defaultPlayerOptions, props.playerOptions);

const utilControlCompSetup = () => {
  return new Promise<void>(resolve => {
    let timer = setInterval(() => {
      if(VideoOverlayRef.value) {
        clearInterval(timer);
        resolve();
      }
    }, 10);
  })
};

onMounted(() => {
  player.value = videojs('sv-video__original', playerOptions, async function onReady(this: any) {
    if(props.hideControl) return;
    isSetup.value = true;
    await utilControlCompSetup();
    VideoOverlayRef.value!.initPlayer(this);
  });
});

onBeforeUnmount(() => {
  player.value?.dispose();
});

defineExpose({
  VideoRef
});
</script>

<style lang="scss">
@use '@/assets/style/components/video-content.scss' as *;
</style>