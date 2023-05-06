import { get, post, nativeFetch } from '@/utils/http';

import type { MaybeComputedRef } from '@vueuse/core';
import type { HttpResponse, WatchOption } from '@/utils/http';
import type {
  UserInfo,
  RegisterInfo,
  VideoInfo,
  PagingVideoInfo,
  COSBucketSecret,
  ParamsForVideoFetch,
} from './use-api-types';

export const useLogin = (params: { username: string, password: string }) => {
  return post('/user/login', params) as HttpResponse<string>;
};

export const useRegister = (params: RegisterInfo) => {
  return post('/user/register', params) as HttpResponse<boolean>;
};

export const useGetUserInfo = (watch?: WatchOption) =>
  get('/user/getUserInfo', undefined, undefined, { watch }) as HttpResponse<UserInfo>;

export const useLogout = () => post('/user/logout') as HttpResponse<null>;

export const useGetBannerVideos = (
  params: MaybeComputedRef<ParamsForVideoFetch>,
  watch?: WatchOption
) => 
  post('/vod/getBannerVideos', params, undefined, { watch }) as HttpResponse<VideoInfo[]>;

export const useGetVideos = (
  params: MaybeComputedRef<ParamsForVideoFetch>,
  watch?: WatchOption
) => 
  post('/vod/getCategoryVideos', params, undefined, { watch }) as HttpResponse<VideoInfo[]>;

/**
 * this composable will be called only on client-side after hydration,
 * so consider to use native Fetch API instead of AyncData.
 */
export const useGetMoreVideos = (
  params: ParamsForVideoFetch,
) => 
  nativeFetch('/vod/getMoreVideos', 'post', params) as Promise<VideoInfo[]>;

export const useGetAllPagingVideos = (
  params: MaybeComputedRef<{
    page: number,
    size: number,
    categories: ParamsForVideoFetch
  }>,
  watch?: WatchOption
) => post(
      `/vod/getAllVideos`,
      params,
      undefined,
      { watch }
    ) as HttpResponse<PagingVideoInfo>;

export const useGetVideoUrl = (key: string) =>
  get('/vod/getVideoUrl', { key }) as HttpResponse<string>;

export const useAddVideo = (
  params: {
    title: string;
    coverKey: string;
    videoKey: string;
    categories: ParamsForVideoFetch;
    tags: string[]
  }
) => nativeFetch(
      '/vod/admin/saveVideoMsg',
      'post',
      params
    ) as Promise<boolean>;

export const useGetCOSSecret = () =>
  post(
    '/vod/admin/cos/getCosSecret',
    undefined,
    undefined,
    { immediate: false }
  ) as HttpResponse<COSBucketSecret>;