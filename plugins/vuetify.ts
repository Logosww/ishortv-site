import { createVuetify } from 'vuetify';
import { zhHans } from 'vuetify/locale';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';


const vuetify = createVuetify({
  ssr: true,
  locale: {
    locale: 'zhHans',
    messages: { zhHans }
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    }
  },
});

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(vuetify);
});