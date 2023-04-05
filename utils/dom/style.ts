import { isClient } from '@vueuse/core';
import { camelize, isObject } from '@vue/shared'; 

import type{ CSSProperties } from 'vue';

export const getStyle = (
  el: HTMLElement,
  styleName: keyof CSSProperties
): string => {
  if(!isClient || !el || !styleName) return '';

  let key = camelize(styleName);
  if(key === 'float') key = 'cssFloat';
  try {
    const style = (el.style as any)[key];
    if(style) return style;
    const computed: any = document.defaultView?.getComputedStyle(el, '');
    return computed ? computed[key] : '';
  } catch {
    return (el.style as any)[key];
  }
};

export const setStyle = (
  el: HTMLElement,
  styleName: CSSProperties | keyof CSSProperties | string,
  value?: string | number
) => {
  if(!el || !styleName) return;
  if(isObject(styleName)) {
    Object.entries(styleName).forEach(([prop, value]) => setStyle(el, prop, value));
  } else {
    const key: any = camelize(styleName);
    el.style[key] = value as any;
  }
};

export const removeStyle = (
  el: HTMLElement,
  style: CSSProperties | keyof CSSProperties | string
) => {
  if(!el || !style) return;
  if(isObject(style)) Object.keys(style).forEach(prop => removeStyle(el, prop));
  else setStyle(el, style, '');
};