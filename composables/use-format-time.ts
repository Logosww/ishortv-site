import type { Ref } from 'vue';

export const useFormatTime = (
  currentTime: Ref<number>,
  duration: Ref<number | undefined>
) => {
  const format = (sec: number) => {
    sec = ~~sec;
    let minute = 0;
    if(sec >= 60) minute = ~~(sec / 60);
    sec = sec % 60;
    return `${minute > 9 ? '' : '0'}${minute}:${sec > 9 ? '' : '0'}${sec}`;
  };

  const cachedDuration = computed(() => duration.value && format(duration.value));

  const formattedTime = computed(() => ({
    current: format(currentTime.value),
    duration: cachedDuration
  }));

  const formattedTimeline = computed(() => 
    `${format(currentTime.value)} / ${ cachedDuration.value ?? '' }`
  );

  return {
    formattedTime,
    formattedTimeline,
    format
  };
};