<template>
    <Modal :is-open="isModalOpen" @close="isModalOpen = false">
        <div
            class="flex w-full flex-col items-center justify-center space-y-6 p-6 text-center"
        >
            <Icon name="alert" class="h-20 w-20" />
            <h3>Are you sure? This action is irreversible!</h3>
            <p class="mt-2 text-slate-300">
                You are about to restore a backup. This will delete all your
                current data and replace it with the data from the backup.
            </p>
            <div class="grid w-full grid-cols-2 space-x-3">
                <button
                    class="rounded-lg bg-spacex-2 py-2.5 focus:ring-2 focus:ring-white"
                    @click="isModalOpen = false"
                >
                    Cancel
                </button>
                <button
                    :class="`rounded-lg bg-spacex-primary py-2.5 focus:ring-2 focus:ring-white ${
                        isRestoring && 'cursor-not-allowed opacity-50'
                    }`"
                    :disabled="isRestoring"
                    @click="restoreFromBackup"
                >
                    Restore
                </button>
            </div>
        </div>
    </Modal>
    <div
        class="relative flex h-[176px] flex-col items-center justify-center overflow-hidden rounded-lg bg-spacex-2 p-4 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @touchstart="handleMouseEnter"
        @touchend="handleMouseLeave"
    >
        <div class="mt-5 flex h-full w-full flex-col items-center">
            <Icon name="file-archive" class="text-4xl" />
            <h6 class="mt-1.5 text-slate-400">{{ data.id }}</h6>

            <div class="mt-1 flex items-center justify-center gap-2">
                <span class="text-sm text-slate-400">{{
                    data.size.formatted
                }}</span>
                <span class="text-sm text-slate-400">-</span>
                <span class="text-sm text-slate-400">
                    {{ new Date(data.date).toLocaleString() }}
                </span>
            </div>
        </div>
        <div
            ref="controlsRef"
            class="absolute bottom-0 hidden w-full items-center justify-center gap-4 rounded-b-xl border-t-2 border-t-spacex-primary bg-spacex-2 px-3 py-2"
        >
            <button
                :class="`rounded-lg p-2 text-slate-400 ring-1 ring-spacex-primary transition-colors duration-300 hover:bg-spacex-primary hover:text-white ${
                    isRestoring && 'cursor-not-allowed opacity-50'
                }`"
                aria-label="Restore from backup"
                :disabled="isRestoring"
                @click="isModalOpen = true"
            >
                <Icon name="restore" />
            </button>
            <button
                class="rounded-lg p-2 text-slate-400 ring-1 ring-spacex-primary transition-colors duration-300 hover:bg-spacex-primary hover:text-white"
                aria-label="Download backup"
                @click="handleDownload"
            >
                <Icon name="download" />
            </button>
            <button
                :class="`rounded-lg p-2 text-slate-400 ring-1 ring-spacex-primary transition-colors duration-300 hover:bg-spacex-primary hover:text-white ${
                    isDeleting && 'cursor-not-allowed opacity-50'
                }`"
                aria-label="Delete backup"
                :disabled="isDeleting"
                @click="handleDelete"
            >
                <Icon name="trash" />
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import gsap from 'gsap';
import { fire } from '@/util/toast';
import { useBackupsStore } from '@/store';
import type { Backup } from '@/types';

const { data } = defineProps<{
    data: Backup;
}>();

const runtimeConfig = useRuntimeConfig();
const store = useBackupsStore();

const controlsRef = ref<HTMLDivElement>();

const isDeleting = ref(false);
const isRestoring = ref(false);
const isModalOpen = ref(false);

const handleMouseEnter = () => {
    gsap.fromTo(
        controlsRef.value!,
        {
            y: 50,
            opacity: 0,
        },
        {
            display: 'flex',
            duration: 0.2,
            y: 0,
            opacity: 1,
        },
    );
};

const handleMouseLeave = () => {
    gsap.to(controlsRef.value!, {
        display: 'none',
        duration: 0.2,
        y: 50,
        opacity: 0,
    });
};

const handleDelete = async () => {
    isDeleting.value = true;

    const json = await store.deleteBackup(data.id);

    isDeleting.value = false;

    if (json?.error) {
        fire(json.error, {
            type: 'error',
        });
    } else {
        fire('Backup has been deleted successfully!', {
            type: 'success',
        });
    }
};

const handleDownload = async () => {
    window.open(
        `${runtimeConfig.public.apiURL}/backups/${data.id}?token=${
            useCookie('token').value
        }`,
        '_blank',
    );
};

const restoreFromBackup = async () => {
    isRestoring.value = true;
    isModalOpen.value = false;

    const json = await store.restoreFromBackup(data.id);

    isRestoring.value = false;

    if (json?.error) {
        fire(json.error, {
            type: 'error',
        });
    } else {
        fire(
            'Backup has been restored successfully! Please wait a few seconds for the changes to take effect.',
            {
                type: 'success',
            },
        );
    }
};
</script>
