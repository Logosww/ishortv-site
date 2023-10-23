export interface Auth {
  accessToken: string;
  refreshToken: string;
};
export interface UserInfo {
  username: string;
  nickname: string;
  email: string;
  avatar?: string;
  sex?: string;
  birthday?: string;
  signature?: string;
};
export interface RegisterInfo extends UserInfo {
  password: string;
};

export interface VideoInfo {
  id: number;
  title: string;
  coverUrl: string;
  videoKey: string;
  duration: string;
  tags: string[];
};
export interface BannerVideoInfo extends VideoInfo {
  bannerCoverUrl?: string;
};
export interface PagingData<T> {
  currentPage: number;
  pageSize: number;
  totalPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  items: T[];
};

export interface COSBucketSecret {
  credentials: {
    tmpSecretId: string;
    tmpSecretKey: string;
    sessionToken: string;
  };
  startTime: number;
  expiredTime: number;
};

export type CategoryType 
  = 'recommend'
  | 'landscape'
  | 'funny'
  | 'sport'
  | 'chilren'
  | 'other'
  | 'all'
  | undefined;
export type CollectionType = 'product' | 'material' | undefined;
export type ParamsForVideoFetch = [CollectionType, CategoryType?];