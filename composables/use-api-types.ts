export interface Auth {
  accessToken: string;
  refreshToken: string;
};
export interface UserInfo {
  username: string;
  nickname: string;
  email: string;
};
export interface RegisterInfo extends UserInfo {
  password: string;
};

export interface VideoInfo {
  title: string;
  coverUrl: string;
  key: string;
};
export interface PagingVideoInfo {
  currentPage: number;
  pageSize: number;
  totalPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  items: VideoInfo[]
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
export type ParamsForVideoFetch = [CollectionType, CategoryType];