import { useMessage } from '@/composables/use-message';
import { sendRedirect } from 'h3';

import type {
  UseFetchOptions as _UseFetchOptions
} from 'nuxt/dist/app/composables';
import type { MaybeRef } from '@vueuse/core';
import type { SearchParameters } from 'ofetch';

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

const baseURL = 'https://api.ishortv.top/ishortv';

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
  const message = process.server ? undefined : useMessage();

  const redirectToLogin = async () => {
    if(process.server) {
      const event = process.server ? useRequestEvent() : undefined;
      return sendRedirect(event!, '/login', 301);
    }
    else {
      message!({ type: 'danger', message: '登录信息过期，请重新登录' });
      await navigateTo('/login', { redirectCode: 302 });
    }
  };

  return useFetch(
    url,
    { 
      credentials: 'include',
      headers: customHeaders,
      baseURL,
      deep: false,
      transform: (res: ResOptions<T>) => res ? res.data : null,
      onResponse: ({ response }) => {
        const { _data, ok } = response;
        if(!ok) return;
        
        const { code, msg } = _data as ResOptions<unknown>;
        if(code !== 1) {
          message?.({ type: 'danger', message: msg });
          return Promise.reject(msg);
        }
      },
      onResponseError: ({ response }) => {
        const { status } = response;
        if(status === 401 || status === 409)
          redirectToLogin();
        else if(status === 403) 
          message!({ type: 'danger', message: '你的权限不足' });
        else message?.({ type: 'danger', message: '网络异常' });

        return Promise.reject();
      },
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
  const message = useMessage();

  return new Promise<T>((resolve, reject) => {
    $fetch<ResOptions<T>>(url, {
      method,
      baseURL,
      credentials: 'include',
      ...resolvedParams,
      headers
    }).then(_data => {
      const data = _data;
      if(data.code !== 1) {
        message?.({ type: 'danger', message: data.msg });
        return reject(data.msg);
      }
      return resolve(data.data);
    }).catch(err => {
      if(!err.data) {
        message?.({ type: 'danger', message: '网络异常' });
        return reject(err.data);
      }
      const { status } = err.data as Response;
      if(status === 401 || status === 409) {
        message?.({ type: 'danger', message: '登录信息过期，请重新登录' });
        navigateTo('/login', { redirectCode: 302 });
      } else if (status === 403)
        message?.({ type: 'danger', message: '你的权限不足' });
      else message?.({ type: 'danger', message: '网络异常' });
      
      return reject(err.data);
    })
  });
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