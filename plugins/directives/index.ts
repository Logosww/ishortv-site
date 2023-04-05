import InfiniteScroll from './infinite-scroll';
import { Ripple } from 'vuetify/directives';

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.directive('InfiniteScroll', InfiniteScroll);
  nuxtApp.vueApp.directive('Ripple', Ripple);
});