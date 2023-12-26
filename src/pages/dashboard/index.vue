<template>
    <h2>Welcome back, {{ _.upperFirst(userStore.username) }}</h2>
    <div class="mt-6">
        <h3>Statistics</h3>
        <Stats class="mt-3" />
    </div>

    <div class="mt-16">
        <h3>Recent Uploads</h3>
        <DashboardRecentUploads class="mt-3" />
    </div>

    <div class="mt-16">
        <h3>Uploads</h3>
        <DashboardUploadsTable class="mt-3" />
    </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { useStatsStore, useUploadsStore, useUserStore } from '@/store';

const statsStore = useStatsStore();
const uploadStore = useUploadsStore();
const userStore = useUserStore();

if (!statsStore.statsLoaded) {
    await statsStore.fetchStats();
}

if (!uploadStore.uploadsLoaded) {
    await uploadStore.fetchUploads();
}

definePageMeta({
    layout: 'dashboard',
});

useHead({
    title: 'Dashboard',
    meta: [
        {
            name: 'og:title',
            content: 'Dashboard | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
