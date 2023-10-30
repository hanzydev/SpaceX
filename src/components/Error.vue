<template>
    <div class="flex items-center justify-between max-md:flex-col">
        <div class="flex flex-col justify-center">
            <h2 class="!mt-1 select-none font-medium md:!text-5xl">
                {{ code }}
            </h2>

            <h2 class="!mt-1 select-none md:!text-5xl">{{ title }}</h2>
            <div class="mt-3 h-1 rounded-full bg-spacex-primary"></div>
            <p class="mt-3 font-medium text-slate-200">{{ message }}</p>

            <button
                class="mt-4 h-11 rounded-lg bg-spacex-primary py-2.5 text-center focus:ring-2 focus:ring-white md:w-52"
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
            class="select-none max-md:mt-3 md:ml-32"
            draggable="false"
        />
    </div>
</template>

<script setup lang="ts">
import gsap from 'gsap';
import type { RouteLocationRaw } from 'vue-router';

const {
    code,
    title,
    message,
    button = {
        to: '/',
        content: 'Go back home',
    },
} = defineProps<{
    code: number;
    title: string;
    message: string;
    button?: { to: RouteLocationRaw; content: string };
}>();

const moonRef = ref<HTMLImageElement>();

onMounted(() => {
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
</script>
