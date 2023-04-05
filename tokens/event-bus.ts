import type { EventBusKey, UseEventBusReturn } from '@vueuse/core';
import type { InjectionKey } from 'vue'; 

export type EventBusContext = UseEventBusReturn<string, any>;

export const eventBusKey: EventBusKey<string> = Symbol('EventBusKey');
export const eventBusContextKey: InjectionKey<EventBusContext> = Symbol('EventBusContextKey');