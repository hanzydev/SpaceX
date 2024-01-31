<template>
    <NuxtLoadingIndicator
        color="var(--color-spacex-primary)"
        :duration="3000"
        :throttle="0"
    />
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>

<script setup lang="ts">
import 'vue3-toastify/dist/index.css';

import { applyTheme } from '@/util/apply-theme';
import { initWebSocket } from '@/util/ws';

onMounted(() => {
    applyTheme();
    initWebSocket();
});

useHead({
    title: 'SpaceX',
    titleTemplate: (title) =>
        title
            ? title === 'SpaceX' || title.match(/\.|:/)
                ? title
                : `${title} · SpaceX`
            : 'SpaceX',
    bodyAttrs: {
        class: 'w-full h-full bg-spacex-5 text-white absolute overflow-x-hidden font-[Montserrat]',
    },
});
</script>
