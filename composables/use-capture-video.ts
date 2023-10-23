import type { MaybeRefOrGetter } from '@vueuse/shared';

export const useCaptureVideo = (
  target: MaybeRefOrGetter<HTMLVideoElement | undefined>
) => {

  const captureVideoCover = () => {
    const video = resolveUnref(target);
    const { videoWidth: width, videoHeight: height } = video!;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx?.drawImage(video!, 0, 0, width, height);
    const imageSrc = canvas.toDataURL('image/png');
    return imageSrc;
  };

  return { captureVideoCover };
};