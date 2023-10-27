import { useMessage } from '@/composables/use-message';
import { sendRedirect } from 'h3';

import type {
  UseFetchOptions as _UseFetchOptions
} from 'nuxt/dist/app/composables';
import type { MaybeRef } from '@vueuse/core';
import type { SearchParameters, FetchOptions, FetchResponse } from 'ofetch';

interface ResOptions<T> {
  data: T;
  code: number;
  msg: string;
};

type PostRequestBody = MaybeRef<Record<string, any>>;
type UseFetchOptions<T> = _UseFetchOptions<ResOptions<T>, T>;
export type OtherUseFetchOptions<T> = Omit<UseFetchOptions<T>, 'query' | 'body' | 'headers'>;
type RequestMethodType = 
  "get" | "head" | "patch" | "post" | "put" | "delete" | "connect" | "options" | "trace";
export type WatchOption = OtherUseFetchOptions<unknown>['watch'];

let message: ReturnType<typeof useMessage> | undefined;

const baseURL = 'https://api.ishortv.top/ishortv';

const interceptors: Pick<FetchOptions<'json'>, 'onResponse' | 'onResponseError'> = {
  onResponse: ({ response }) => {
    const { _data, ok } = response as FetchResponse<ResOptions<unknown>>;
    if(!ok) return;
    
    const { code, msg } = _data!;
    if(code !== 1) {
      message?.({ type: 'danger', message: msg });
      return Promise.reject(msg);
    }
  },
  onResponseError: ({ response }) => {
    const { status } = response;
    if(status === 401 || status === 409) {
      message?.({ type: 'danger', message: '登录信息过期，请重新登录' });
      redirectToLogin();
    } else if(status === 403) 
      message!({ type: 'danger', message: '你的权限不足' });
    else message?.({ type: 'danger', message: '网络异常' });

    return Promise.reject(response.statusText);
  },
}

const redirectToLogin = async () => {
  if(process.server) {
    const event = useRequestEvent();
    return sendRedirect(event!, '/login', 301);
  }
  else await navigateTo('/login', { redirectCode: 302 });
};

/**
 * 封装 useFetch
 * @param { string } url 请求地址
 * @param { UseFetchOptions } options useFetchOptions
 * @param { object } headers 自定义Headers
 */
const fetch = <T>(
  url: string,
  options?: UseFetchOptions<T>,
  headers?: HeadersInit
) => {
  // consider to send cookies instead of adding token to the headers
  const originalHeaders = useRequestHeaders(['cookie']);
  const customHeaders = originalHeaders 
    ? {
      // proxy bypass cookies from client, only work in server-side call on API
      ...headers,
      cookie: originalHeaders.cookie ?? ''
    }
    : headers;
  
  message = process.server ? undefined : useMessage();

  return useFetch(
    url,
    { 
      credentials: 'include',
      headers: customHeaders,
      baseURL,
      deep: false,
      transform: (res: ResOptions<T>) => res ? res.data : null,
      ...interceptors,
      ...options
    }
  );
};

// 封装 ofetch，只用于客户端请求接口，而非 SSR 阶段的 AsyncData。
export const nativeFetch = async <T>(
  url: string,
  method: RequestMethodType,
  params?: SearchParameters | PostRequestBody,
  headers?: HeadersInit
) => {
  const resolvedParams = method === 'get'
    ? { query: params as SearchParameters }
    : { body: params as PostRequestBody };
  
  message = useMessage();

  return $fetch<ResOptions<T>>(url, {
    method,
    baseURL,
    credentials: 'include',
    ...resolvedParams,
    ...interceptors,
    headers
  }).then(({ data }) => data);
};

export const get = <T>(
  url: string,
  query?: SearchParameters,
  headers?: HeadersInit,
  otherOptions?: OtherUseFetchOptions<T>
) =>
  fetch<T>(url, { method: 'get', query, ...otherOptions }, headers);

export const post = <T>(
  url: string,
  body?: PostRequestBody,
  headers?: HeadersInit,
  otherOptions?: OtherUseFetchOptions<T>
) =>
  fetch<T>(url, { method: 'post', body, ...otherOptions }, {
    'Content-Type': 'application/json',
    ...headers
  });

export const put = <T>(
  url: string,
  body: PostRequestBody,
  headers?: HeadersInit
) =>
  nativeFetch<T>(url, 'put', body, { 'Content-Type': 'application/json', ...headers });

export const del = <T>(
  url: string,
  body?: PostRequestBody,
  headers?: HeadersInit
) =>
  nativeFetch<T>(url, 'delete', body, headers);