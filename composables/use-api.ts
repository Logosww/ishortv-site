import { get, post, del, nativeFetch } from '@/utils/http';

import type { WatchOption, OtherUseFetchOptions } from '@/utils/http';
import type {
  UserInfo,
  RegisterInfo,
  VideoInfo,
  PagingData,
  COSBucketSecret,
  ParamsForVideoFetch,
  BannerVideoInfo,
} from './use-api-types';

export const useLogin = (params: { username: string, password: string }) => 
  nativeFetch<string>('/user/login', 'post', params);

export const useRegister = (params: RegisterInfo) => 
  nativeFetch<boolean>('/user/register', 'post', params);

export const useGetUserInfo = () =>
  get<UserInfo>('/user/getUserInfo');

export const useModifyUserInfo = (params: Partial<UserInfo>) =>
  put<void>('/user/modifyUser', params);

export const useLogout = () => nativeFetch<void>('/user/logout', 'post');

export const useModifyPassword = (
  params: {
    oldPasswd: string;
    newPasswd: string;
  }
) => put<void>('/user/modifyPassword', params);

export const useDeleteAccount = () => del<void>('/user/deleteUser');

export const useGetBannerVideos = (
  params: MaybeRefOrGetter<ParamsForVideoFetch>,
  otherOptions?: OtherUseFetchOptions<BannerVideoInfo[]>
) => 
  post<BannerVideoInfo[]>('/public/getBannerVideos', params, undefined, otherOptions);

export const useGetVideos = (
  params: MaybeRefOrGetter<{ categories: ParamsForVideoFetch, lastId: number }>,
) => 
  post<VideoInfo[]>('/public/getMoreVideos', params);

export const useAdminGetVideos = (
  params: MaybeRefOrGetter<{ categories: ParamsForVideoFetch, lastId: number }>,
  otherOptions?: OtherUseFetchOptions<VideoInfo[]>
) =>
  post<VideoInfo[]>('/admin/selectCategoryBannerVideos', params, undefined, otherOptions);

/**
 * this composable will be called only on client-side after hydration,
 * so consider to use native Fetch API instead of AyncData.
 */
export const useGetMoreVideos = (
  params: {
    categories: ParamsForVideoFetch,
    lastId: number
  }
) => 
  nativeFetch<VideoInfo[]>('/public/getMoreVideos', 'post', params);

export const useGetAllPagingVideos = (
  params: MaybeRefOrGetter<{
    page: number,
    size: number,
    categories: ParamsForVideoFetch
  }>
) => 
  post<PagingData<VideoInfo>>('/admin/getCategoryAllVideos', params);

export const useGetVideoUrl = (key: string) =>
  get<string>('/public/getVideoUrl', { key });

export const useGetVideoInfo = (key: string) =>
  get<VideoInfo>('/public/getVideo', { key });

export const useAddVideo = (
  params: {
    title: string;
    coverKey: string;
    videoKey: string;
    categories: ParamsForVideoFetch;
    tags: string[]
  }
) => 
  nativeFetch<boolean>(
    '/admin/saveVideoMsg',
    'post',
    params
  );

export const useGetCOSSecret = () =>
  post<COSBucketSecret>(
    '/admin/getCosSecret',
    undefined,
    undefined,
    { immediate: false }
  );

export const useGetRecommendVideos = (key: string) =>
  get<VideoInfo[]>('/public/getRelatedSuggestionVideos', { key });

export const useSetBannerVideo = (id: number) =>
  nativeFetch<void>('/admin/saveBannerVideo', 'post', { id, bannerCoverKey: '' });

export const useSetBannerVideoCover = (params: { id: number; bannerCoverKey: string }) =>
  nativeFetch<void>('/admin/saveBannerVideo', 'post', params);

export const useDeleteBannerVideo = (id: number) =>
  del<void>('/admin/deleteBannerVideo', { id });

export const useGetHitVideos = () => get<VideoInfo[]>('/public/getHotVideos');

export const useCompleteQuery = (params: { likeVideoName: string }) =>
  nativeFetch<string[]>('/public/querySuggestions/queryListVideoName', 'get', params);

export const useQueryVideos = (params: MaybeRefOrGetter<{
  query: string;
  order: 0 | 1 | 2;
  category: CategoryType;
  page: number;
  size?: number;
}>) => post<PagingData<VideoInfo>>('/public/getPageQueryVideos', params);