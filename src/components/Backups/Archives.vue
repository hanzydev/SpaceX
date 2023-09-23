<template>
    <p v-if="!store.backups.length" class="text-slate-300 mt-4">
        No backups found.
    </p>
    <div
        v-else
        class="grid max-sm:grid-cols-1 max-xl:grid-cols-2 max-[1500px]:grid-cols-3 max-[1700px]:grid-cols-4 grid-cols-5 gap-4 mt-4"
    >
        <BackupView
            v-for="backup in store.backups"
            :key="backup.id"
            :data="backup"
        />
    </div>
</template>

<script setup lang="ts">
import { useBackupsStore } from '@/store';

const store = useBackupsStore();
</script>
