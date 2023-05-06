<template>
  <teleport to='#sv-video__original'>
    <div :class="['sv-video-overlay', hideCursor ? 'hide-cursor' : '']" ref="VideoOverlayRef" @click.self="handlePlay">
      <transition name="sv-video-controls-down">
        <div class="sv-video-header" v-show="isUserActive" v-if="isModal && !fullScreen">
          <span class="sv-video-header__title">{{ title ?? '视频' }}</span>
          <v-btn 
            class="sv-video-header__close"
            :icon="mdiCloseThick"
            color="white"
            size="36"
            @click="emit('close-modal')"
          />
        </div>
      </transition>
      <transition name="sv-video-controls-up">
        <div class="sv-video-controls" v-show="isUserActive"  @click.self="handlePlay">
          <div 
            :class="['sv-video-controls__inner', fullScreen ? 'full-screen' : '']"
            ref="VideoControlsRef"
            @click.stop
          >
            <div class="sv-video-controls__progress">
              <v-btn 
                class="sv-video-controls__play"
                variant="text"
                :icon="playBtnIcon"
                color="white"
                @click.stop="handlePlay"
              />
              <v-slider
                ref="ControlsSliderRef"
                color="white"
                v-model="currentProgress"
                @click="seekTime"
                hide-details
              />
              <div class="sv-video-controls__time">
                {{ formattedTimeline }}
              </div>
            </div>
            <div class="sv-video-controls__operations">
              <v-btn
                class="sv-video-controls__quality"
                variant="text"
                rounded="pill"
                width="64"
                @click="showQualityMenu = !showQualityMenu"
                v-if="isStreaming"
              >
                {{ currentQuality.title }}
                <transition name="video-controls-sub-up">
                  <ul class="sv-video-controls__quality-menu" v-show="showQualityMenu">
                    <li
                      class="sv-video-controls__quality-item"
                      v-for="(item, index) in videoQualityOptions"
                      :key="index"
                      @click.stop="handleQualityChange(index)"
                      v-ripple
                    >
                      {{ item.title }}
                    </li>
                  </ul>
                </transition>
              </v-btn>
              <v-btn
                class="sv-video-controls__volume"
                variant="text"
                icon=""
                color="white"
                @mouseenter="showVolumeBar = true"
                @mouseleave="showVolumeBar = false"
              >
                <v-icon :icon="mdiVolumeMedium" v-show="!isMuted" @click="toggleMuted" />
                <v-icon :icon="mdiVolumeVariantOff" v-show="isMuted" @click="toggleMuted" />
                <transition name="video-controls-sub-up">
                  <div class="sv-video-controls__volume-bar" v-show="showVolumeBar">
                    <v-slider 
                      direction="vertical"
                      thumb-size="14"
                      color="white"
                      v-model="volume"
                      step="1"
                      @mousedown="storedVolume = volume"
                      @update:model-value="setVolume"
                      thumb-label
                      track-size="3"
                      hide-details
                    />
                  </div>
                </transition>
              </v-btn>
              <v-btn
                class="sv-video-controls__fullscreen"
                variant="text"
                :icon="mdiFullscreen"
                color="white"
                @click="handleFullScreen"
              />
            </div>
          </div>
        </div>
      </transition>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { 
  mdiCloseThick,
  mdiPlay,
  mdiPause,
  mdiVolumeMedium,
  mdiVolumeVariantOff,
  mdiFullscreen
} from '@mdi/js';

import type { Player } from './VideoContent.vue';
import type { VSlider } from 'vuetify/components';

interface VideoQuality {
  title: string;
  value: string;
};

const props = defineProps<{ 
  player: Player;
  isModal?: boolean;
  autoplay?: boolean;
  title?: string;
}>();
const emit = defineEmits(['close-modal']);

const { player } = props;
const VideoOverlayRef = ref<HTMLVideoElement>();
const VideoControlsRef = ref<HTMLDivElement>();
const ControlsSliderRef = ref<InstanceType<typeof VSlider>>();

const volume = ref(50);
const storedVolume = ref(50);
const currentTime = ref(0);
const duration = ref(0);
const currentProgress = ref(0);
const playBtnIcon = ref(props.autoplay ? mdiPause : mdiPlay);
const fullScreen = ref(!props.isModal);
const stopOnProgress = ref(false);
const showVolumeBar = ref(false);
const showQualityMenu = ref(false);
const isStreaming = ref(true);
const isUserActive = ref(true);
const hideCursor = ref(false);
const currentQualityIndex = ref(0);
const videoQualityOptions = ref<VideoQuality[]>([
  {
    title: '自动',
    value: 'auto'
  },
  {
    title: '480P',
    value: '480p'
  },
  {
    title: '720P',
    value: '720p'
  },
  {
    title: '1080P',
    value: '1080p'
  },
]);

const isMuted = computed(() => volume.value === 0);
const currentQuality = computed(() => videoQualityOptions.value[currentQualityIndex.value]);
const { formattedTimeline } = useFormatTime(currentTime, duration);
const shouldHideControls = computed(() => 
  !showQualityMenu.value && !showVolumeBar.value && isOutsideControls.value
);

const { isOutside: isOutsideControls } = 
  useMouseInElement(VideoControlsRef, { handleOutside: false });

const seekTime = () => {
  stopOnProgress.value = true;
  const progress = ControlsSliderRef.value?.modelValue as number;
  player.currentTime(duration.value * progress / 100);
  stopOnProgress.value = false;
};

const setVolume = (volume: number) => {
  player.volume(volume / 100);
};

const toggleMuted = () => {
  if(!isMuted.value) {
    player.muted(true);
    storedVolume.value = volume.value;
    volume.value = 0;
  } else {
    player.muted(false);
    volume.value = storedVolume.value;
    setVolume(storedVolume.value);
  }
};

// @ts-ignore
useEventListener(ControlsSliderRef, 'mouseup', seekTime);
// @ts-ignore
useEventListener(ControlsSliderRef, 'mousedown', () => stopOnProgress.value = true);
useEventListener(document, 'fullscreenchange', () => {
  fullScreen.value = !!document.fullscreenElement;
});
useEventListener(VideoOverlayRef, 'mousemove', () => {
  isUserActive.value = true;
  if(hideCursor.value) hideCursor.value = false;
  if(!isTimerPending.value) startTimer();
});

const { 
  start: startTimer,
  isPending: isTimerPending
} = useTimeoutFn(() => {
  if(shouldHideControls.value) {
    isUserActive.value = false;
    if(fullScreen.value) hideCursor.value = true
  }
}, 4000);

const onProgress = useThrottleFn(() => {
  if(stopOnProgress.value) return;
  currentTime.value = player.currentTime()!;
  currentProgress.value = (currentTime.value / duration.value) * 100;
}, 200);

const initPlayer = (playerInstance: any) => {
  let _this = playerInstance;
  _this.one('loadedmetadata', () => {
    duration.value = player.duration()!; 
    player.volume(volume.value / 100);
  });
  _this.one('canplaythrough', () => playBtnIcon.value = mdiPause);
  _this.on('timeupdate', onProgress);
  _this.on('ended', () => playBtnIcon.value = mdiPlay);
};

const handlePlay = () => {
  const isPaused = player.paused();
  if(isPaused) player.play();
  else player.pause();
  if(showVolumeBar.value) showVolumeBar.value = false;
  playBtnIcon.value = isPaused ? mdiPause : mdiPlay;
};

const handleFullScreen = () => {
  const isFullScreen = player.isFullscreen()
  if(!isFullScreen) player.requestFullscreen();
  else player.exitFullscreen();
  fullScreen.value = !isFullScreen;
};

const handleQualityChange = (index: number) => {
  currentQualityIndex.value = index;
  showQualityMenu.value = false;
};

defineExpose({
  initPlayer
});
</script>

<style lang="scss">
@use '@/assets/style/components/video-overlay' as *;
</style>