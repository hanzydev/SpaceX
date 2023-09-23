<template>
    <h2>Uploads</h2>
    <Uploads class="mt-6" />
</template>

<script setup lang="ts">
import { useUploadsStore } from '@/store';

const store = useUploadsStore();

if (!store.uploadsLoaded) {
    await store.fetchUploads();
}

definePageMeta({
    layout: 'dashboard',
});

useHead({
    title: 'Uploads',
    meta: [
        {
            name: 'og:title',
            content: 'Uploads | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
