<template>
    <div class="flex max-md:flex-col justify-between items-center">
        <div class="flex justify-center flex-col">
            <h2 class="!mt-1 font-medium md:!text-5xl select-none">
                {{ code }}
            </h2>

            <h2 class="!mt-1 md:!text-5xl select-none">{{ title }}</h2>
            <div class="h-1 bg-spacex-primary mt-3 rounded-full"></div>
            <p class="text-slate-200 font-medium mt-3">{{ message }}</p>

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
