import Message from './my-message';

import type { Plugin } from 'vue'

type SFCWithInstall<T> = T & Plugin;

const withInstallFunction = <T>(fn: T, name: string) => {
  (fn as SFCWithInstall<T>).install = app => {
    app.config.globalProperties[name] = fn;
  };

  return fn as SFCWithInstall<T>
};

export const MyMessage = withInstallFunction(Message, '$message');

export default defineNuxtPlugin(nuxtApp => {
  const { vueApp } = nuxtApp;
  vueApp.use(MyMessage);
});