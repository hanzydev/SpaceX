<template>
    <p v-if="!store.backups.length" class="mt-4 text-slate-300">
        No backups were found.
    </p>
    <div
        v-else
        class="mt-4 grid grid-cols-5 gap-4 max-[1700px]:grid-cols-4 max-[1500px]:grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1"
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
