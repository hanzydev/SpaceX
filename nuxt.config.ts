import svgLoader from 'vite-svg-loader';

export default defineNuxtConfig({
    modules: [
        '@nuxtjs/tailwindcss',
        '@nuxtjs/turnstile',
        '@pinia/nuxt',
        '@vite-pwa/nuxt',
    ],
    srcDir: 'src',
    devtools: { enabled: true },
    tailwindcss: {
        cssPath: '@/assets/main.css',
        configPath: 'tailwind.config.js',
    },
    pwa: {
        strategies: 'generateSW',
        workbox: {
            globPatterns: ['**/*.{js,css}'],
            navigateFallback: null,
        },
        manifestFilename: 'manifest.json',
    },
    app: {
        rootId: '__spacex',
        buildAssetsDir: '_spacex',
        head: {
            title: 'SpaceX',
            link: [
                {
                    rel: 'icon',
                    href: '/favicon.ico',
                },
                {
                    rel: 'apple-touch-icon',
                    href: '/apple-touch-icon.png',
                },
                {
                    rel: 'manifest',
                    href: '/manifest.json',
                },
            ],
            htmlAttrs: {
                lang: 'en',
            },
        },
    },
    vue: {
        propsDestructure: true,
    },
    experimental: {
        clientNodeCompat: true,
    },
    runtimeConfig: {
        public: {
            siteURL: process.env.NUXT_PUBLIC_SITE_URL,
            apiURL: process.env.NUXT_PUBLIC_API_URL,
            wssURL: process.env.NUXT_PUBLIC_WSS_URL,
        },
    },
    vite: {
        plugins: [svgLoader()],
    },
});
