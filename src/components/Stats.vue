<template>
    <div
        class="grid w-full grid-cols-4 gap-5 max-[1600px]:grid-cols-3 max-[1340px]:grid-cols-2 max-[1130px]:grid-cols-1"
    >
        <div
            class="relative flex flex-col rounded-lg bg-spacex-3 p-4 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
        >
            <p class="text-sm font-semibold text-slate-400">UPLOADS</p>
            <Icon
                name="image"
                class="absolute right-0 top-0 mr-3.5 mt-3.5 text-2xl text-spacex-primary"
            />
            <div class="flex items-center gap-3">
                <h3 class="!mt-3">
                    {{ store.stats.totalUploads }}
                </h3>
                <p class="mt-3 text-sm font-medium text-slate-400">
                    file uploaded
                </p>
            </div>
        </div>
        <div
            class="relative flex flex-col rounded-lg bg-spacex-3 p-4 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
        >
            <p class="text-sm font-semibold text-slate-400">UPLOADS</p>
            <Icon
                name="image-plus"
                class="absolute right-0 top-0 mr-3.5 mt-3.5 text-2xl text-spacex-primary"
            />
            <div class="flex items-center gap-3">
                <h3 class="!mt-3">
                    {{ store.stats.todayUploads }}
                </h3>
                <p class="mt-3 text-sm font-medium text-slate-400">
                    file uploaded today
                </p>
            </div>
        </div>
        <div
            class="relative flex flex-col rounded-lg bg-spacex-3 p-4 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
        >
            <p class="text-sm font-semibold text-slate-400">VIEWS</p>
            <Icon
                name="eye"
                class="absolute right-0 top-0 mr-3.5 mt-3.5 text-2xl text-spacex-primary"
            />
            <div class="flex items-center gap-3">
                <h3 class="!mt-3">{{ store.stats.views.today }}</h3>
                <p class="mt-3 text-sm font-medium text-slate-400">
                    today views
                </p>
            </div>
        </div>
        <div
            class="relative flex flex-col rounded-lg bg-spacex-3 p-4 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
        >
            <p class="text-sm font-semibold text-slate-400">STORAGE</p>
            <Icon
                name="hdd"
                class="absolute right-0 top-0 mr-3.5 mt-3.5 text-2xl text-spacex-primary"
            />
            <div class="flex items-center gap-3">
                <h3 class="!mt-3">
                    {{ store.stats.storageUsed }}
                </h3>
                <p class="mt-3 text-sm font-medium text-slate-400">
                    storage used
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useStatsStore } from '@/store';

const store = useStatsStore();
</script>
