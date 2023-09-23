<template>
    <div
        class="grid max-sm:grid-cols-1 max-md:grid-cols-2 max-[1262px]:grid-cols-3 max-[1495px]:grid-cols-4 grid-cols-5 gap-4"
    >
        <UploadView
            v-for="upload in store.uploads.slice(0, 5)"
            :key="upload.id"
            :data="upload"
        />
    </div>
</template>

<script setup lang="ts">
import { useUploadsStore } from '@/store';

const store = useUploadsStore();
</script>
