import { useMessage } from '@/composables/use-message';
import { sendRedirect } from 'h3';

import type {
  AsyncData,
  UseFetchOptions as _UseFetchOptions
} from 'nuxt/dist/app/composables';
import type { Ref } from 'vue';
import type { MaybeRef } from '@vueuse/core';
import type { SearchParameters } from 'ofetch';

interface ResOptions<T> {
  data: T;
  code: number;
  msg: string;
};

type PostRequestBody = MaybeRef<Record<string, any>>;
type UseFetchOptions = _UseFetchOptions<ResOptions<any>>;
type OtherUseFetchOptions = Omit<UseFetchOptions, 'query' | 'body' | 'headers'>;
type RequestMethodType = 
  "get" | "head" | "patch" | "post" | "put" | "delete" | "connect" | "options" | "trace";
export type WatchOption = OtherUseFetchOptions['watch'];
export type HttpResponse<T> =
  Promise<
    Pick<
      AsyncData<T, Error>,
      'refresh' | 'pending'
    > & Record<'data', Ref<T>>
  >;

const baseURL = 'https://api.ishortv.top/ishortv';

/**
 * 封装 useFetch
 * @param { string } url 请求地址
 * @param { UseFetchOptions } options useFetchOptions
 * @param { object } headers 自定义Headers
 */
const fetch = (
  url: string,
  options?: UseFetchOptions,
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
  const event = process.server ? useRequestEvent() : undefined;
  const message = process.server ? undefined : useMessage();

  const redirectToLogin = async () => {
    if(process.server) {
      return sendRedirect(event!, '/login', 301);
    }
    else {
      message!({ type: 'danger', message: '登录信息过期，请重新登录' });
      await navigateTo('/login', { redirectCode: 302 });
    }
  };

  return new Promise(async (resolve, reject) => {

    // proxy bypass set-cookie header from API endpoints
    // const onResponse: UseFetchOptions['onResponse'] = async ({ response }) => {
    //   if(!event) return response._data;
    //   const cookies = (response.headers.get('set-cookie') || '').split(',');
    //   if(!cookies.length) return response._data;;
    //   for(const cookie of cookies) appendHeader(event, 'set-cookie', cookie);
    //   return response._data;
    // };

    // only use response error interceptor when set option immediate to false,
    // cause those request on take place on client-side
    const onResponseError: UseFetchOptions['onResponseError'] | undefined =
      options?.immediate === false
      ? async ({ response }) => {
        const { status } = response;
        if(status === 401 || status === 409) redirectToLogin();
        else if(status === 403) 
          message!({ type: 'danger', message: '你的权限不足' });
      }
      : undefined
    const { data: _data, error, refresh, pending } = await useFetch(
      url,
      { 
        credentials: 'include',
        headers: customHeaders,
        baseURL,
        // onResponse,
        onResponseError,
        ...options
      }
    );

    // skip the error handling process when set option immediate to false;
    if(options?.immediate === false) 
      return resolve({ data: computed(() => _data.value?.data), refresh, pending });

    // error handling for fetch failures
    if(error.value) {
      const { statusCode } = error.value;
      if(statusCode === 401 || statusCode === 409) 
        redirectToLogin();
      else if(statusCode === 403) 
        message!({ type: 'danger', message: '你的权限不足' });
    };

    // custom errors handling in response.ok situations
    if(_data.value && _data.value.code !== 1) {
      message?.({ type: 'danger', message: _data.value.msg });
      return reject(_data.value.msg);
    }
    return resolve({ data: computed(() => _data.value!.data), refresh, pending });
  });
};

// 封装 ofetch，只用于客户端请求接口，而非 SSR 阶段的 AsyncData。
export const nativeFetch = async (
  url: string,
  method: RequestMethodType,
  params: SearchParameters | PostRequestBody,
  headers?: HeadersInit
) => {
  const resolvedParams = method === 'get'
    ? { query: params as SearchParameters }
    : { body: params as PostRequestBody };
  const message = useMessage();

  return new Promise((resolve, reject) => {
    $fetch(url, {
      method,
      baseURL,
      credentials: 'include',
      ...resolvedParams,
      headers
    }).then(_data => {
      const data = _data as unknown as ResOptions<unknown>;
      if(data.code !== 1) {
        message?.({ type: 'danger', message: data.msg });
        return reject(data.msg);
      }
      return resolve(data.data);
    }).catch(err => {
      const { status } = err.data as Response;
      if(status === 401 || status === 409) {
        message?.({ type: 'danger', message: '登录信息过期，请重新登录' });
        navigateTo('/login', { redirectCode: 302 });
      } else if (status === 403)
        message?.({ type: 'danger', message: '你的权限不足' });
      return reject(err.data)
    })
  });
};

export const get = (
  url: string,
  query?: SearchParameters,
  headers?: HeadersInit,
  otherOptions?: OtherUseFetchOptions
) =>
  fetch(url, { method: 'get', query, ...otherOptions }, headers);

export const post = (
  url: string,
  body?: PostRequestBody,
  headers?: HeadersInit,
  otherOptions?: OtherUseFetchOptions
) =>
  fetch(url, { method: 'post', body, ...otherOptions }, {
    'Content-Type': 'application/json',
    ...headers
  });

export const put = (
  url: string,
  body?: PostRequestBody,
  headers?: HeadersInit,
  otherOptions?: OtherUseFetchOptions
) =>
  fetch(url, { method: 'put', body, ...otherOptions }, headers);

export const del = (
  url: string,
  body?: PostRequestBody,
  headers?: HeadersInit,
  otherOptions?: OtherUseFetchOptions
) =>
  fetch(url, { method: 'delete', body, ...otherOptions }, headers);