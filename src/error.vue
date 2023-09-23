<template>
    <div
        class="flex flex-col items-center justify-between w-full h-screen px-8"
    >
        <div class="flex max-md:flex-col justify-between items-center mt-auto">
            <div class="flex justify-center flex-col">
                <h2 class="!mt-1 font-medium md:!text-5xl select-none">
                    {{ error.statusCode }}
                </h2>

                <h2 class="!mt-1 md:!text-5xl select-none">
                    {{ error.title }}
                </h2>
                <div class="h-1 bg-spacex-primary mt-3 rounded-full"></div>
                <p class="text-slate-200 font-medium mt-3">
                    {{ `Houston, we have a problem. ${error.message}` }}
                </p>

                <button
                    class="bg-spacex-primary rounded-lg py-2.5 h-11 mt-4 md:w-52 text-center focus:ring-2 focus:ring-white"
                    @click="$router.push(button.to)"
                >
                    {{ button.content }}
                </button>
            </div>
            <img
                ref="moonRef"
                src="/moon.png"
                width="248"
                height="248"
                alt="Moon"
                class="md:ml-32 max-md:mt-3 select-none"
                draggable="false"
            />
        </div>
        <Footer />
    </div>
</template>

<script setup lang="ts">
import '@/assets/main.css';

import gsap from 'gsap';
import type { NuxtError } from 'nuxt/app';
import { applyTheme } from '@/util/apply-theme';

const { error: raw } = defineProps<{ error: NuxtError }>();

if (process.env.NODE_ENV === 'development' && raw.statusCode === 500) {
    console.log(raw);
}

const route = useRoute();

const error = {
    statusCode: raw.statusCode,
    statusMessage:
        raw.statusCode === 404
            ? 'Not Found'
            : raw.statusCode === 500
            ? 'Internal Server Error'
            : raw.statusCode === 401
            ? 'Unauthorized'
            : 'Unhandled Error',
    title:
        raw.statusCode === 404
            ? 'Spaceship Lost in Space'
            : raw.statusCode === 500
            ? 'Spaceship Exploded'
            : raw.statusCode === 401
            ? 'Spaceship Doors Locked'
            : 'Spaceship Damaged',
    error: raw.message,
    message:
        raw.statusCode === 404
            ? 'The spaceship has lost in space.'
            : raw.statusCode === 500
            ? 'The spaceship has exploded.'
            : raw.statusCode === 401
            ? 'The spaceship doors are locked.'
            : 'The spaceship has been damaged.',
};

const button = computed(() => {
    if (error?.statusCode === 401) {
        return {
            to: {
                path: '/auth/login',
                query: { redirect_to: route.path },
            },
            content: 'Unlock the doors',
        };
    }

    return {
        to: '/',
        content: 'Go back home',
    };
});

const moonRef = ref<HTMLImageElement>();

onMounted(() => {
    applyTheme();

    gsap.to(moonRef.value!, {
        duration: 1,
        x: 10,
        y: 10,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
    });

    gsap.to(moonRef.value!, {
        duration: 31,
        rotation: 360,
        repeat: -1,
        ease: 'none',
    });
});

useHead({
    title: `${error.statusCode}: ${error.statusMessage}`,
    meta: [
        {
            name: 'description',
            content: error.message,
        },
        {
            name: 'og:title',
            content: `${error.statusCode}: ${error.statusMessage}`,
        },
        {
            name: 'og:description',
            content: error.message,
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
    bodyAttrs: {
        class: 'w-full h-full bg-spacex-5 text-white absolute overflow-x-hidden font-[Montserrat]',
    },
});
</script>
