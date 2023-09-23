import { randomBytes } from 'node:crypto';
import svgLoader from 'vite-svg-loader';
import { CF_TURNSTILE_SITE_KEY } from './src/constants';

export default defineNuxtConfig({
    modules: [
        '@nuxtjs/tailwindcss',
        '@nuxtjs/turnstile',
        '@pinia/nuxt',
        '@vite-pwa/nuxt',
    ],
    css: ['normalize.css/normalize.css'],
    srcDir: 'src',
    devtools: { enabled: true },
    tailwindcss: {
        cssPath: '@/assets/main.css',
        configPath: 'tailwind.config.js',
    },
    turnstile: {
        siteKey: CF_TURNSTILE_SITE_KEY,
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
        inlineSSRStyles: false,
    },
    vite: {
        plugins: [svgLoader()],
        build: {
            rollupOptions: {
                output: {
                    assetFileNames: () =>
                        `_spacex/${randomBytes(10).toString('hex')}[extname]`,
                    chunkFileNames: () =>
                        `_spacex/${randomBytes(10).toString('hex')}.js`,
                    entryFileNames: () =>
                        `_spacex/${randomBytes(10).toString('hex')}.js`,
                },
            },
        },
    },
});
