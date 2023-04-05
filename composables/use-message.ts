import type { MessageFn, MessageOptions } from '@/plugins/my-message/my-message';

export const useMessage = () => {
  const { vueApp } = useNuxtApp();
  const appContext = vueApp._context;
  const messageFn = appContext.config.globalProperties['$message'] as MessageFn;
  if(!messageFn) throw new Error('my-message 组件未找到，可能是组件还未注册');
  
  const injectedMessageFn = (options: MessageOptions) => {
    return messageFn(options, appContext);
  }
  return injectedMessageFn;
};