// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify from 'vite-plugin-vuetify';

export default defineNuxtConfig({
  app: {
    head: {
      viewport: '',
    }
  },
  css: [
    'vuetify/styles'
  ],
  plugins: [
    '@/plugins/directives/index.ts',
    '@/plugins/my-message/index.ts'
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/style/_var" as *; @use "@/assets/style/_common" as *;'
        }
      }
    },
    ssr: {
      noExternal: ['vuetify']
    }
  },
  routeRules: {
    '/login': { prerender: true },
    '/register': { prerender: true },
    '/video/**': { isr: true },
  },
  modules: [
    '@vueuse/nuxt',
    async (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', config => {
        config.plugins?.push(vuetify());  // Add vuetify plugin
      })
    }
  ],
  typescript: {
    shim: false
  },
})
