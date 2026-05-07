const isElectron = process.env.ELECTRON === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2025-04-30',

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  ssr: false,

  app: {
    head: {
      title: 'Upsun Manager',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
      ],
      script: [
        {
          innerHTML: `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}})()`,
        },
      ],
    },
  },

  runtimeConfig: {
    upsunApiToken: '',
    upsunApiBaseUrl: 'https://api.upsun.com',
    upsunAuthUrl: 'https://auth.api.platform.sh/oauth2/token',
    public: {
      appVersion: process.env.npm_package_version || '0.0.0',
      githubRepo: 'tdubuffet-lephare/upsun-manager',
    },
  },

  nitro: {
    ...(isElectron ? {
      preset: 'node',
      serveStatic: true,
    } : {}),
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },
})
