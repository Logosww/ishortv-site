<template>
  <div 
    :class="['sv-video-wrapper', isModal ? 'is-modal' : '']"
    :style="{ width: `${width}px`, height: `${height}px` }"
    @click.right.prevent
  >
    <div class="sv-video-container">
      <video
        class="sv-video__original video-js"
        id="sv-video__original"
        ref="VideoRef"
        preload="auto"
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
      :autoplay="playerOptions?.autoplay ?? true"
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
  src: string | null; 
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

let player: Player;

const isSetup = ref(false);
const VideoRef = ref<HTMLVideoElement>();
const VideoOverlayRef = ref<InstanceType<typeof VideoOverlay>>();

const defaultPlayerOptions = {
  fill: true
};
const playerOptions: any = Object.assign(defaultPlayerOptions, props.playerOptions);

const untilControlCompSetup = () => {
  return new Promise<void>(resolve => {
    let timer = setInterval(() => {
      if(VideoOverlayRef.value) {
        clearInterval(timer);
        resolve();
      }
    }, 100);
  })
};

onMounted(() => {
  player = videojs('sv-video__original', playerOptions, async function onReady(this: any) {
    if(props.hideControl) return;
    isSetup.value = true;
    await untilControlCompSetup();
    VideoOverlayRef.value!.initPlayer(this);
    props.src && player!.src({
      src: props.src,
      type: props.type ?? 'video/mp4'
    });
  });
});

onBeforeUnmount(() => {
  player?.dispose();
});

defineExpose({
  VideoRef
});
</script>

<style lang="scss">
@use '@/assets/style/components/video-content.scss' as *;
</style>