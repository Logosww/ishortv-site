import type { InjectionKey, ComputedRef } from 'vue'; 
import type { CategoryType } from '@/composables/use-api-types';

export const categoryKey: InjectionKey<ComputedRef<CategoryType>> = Symbol('CategoryKey');