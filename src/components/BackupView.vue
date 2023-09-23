<template>
    <Modal :is-open="isModalOpen" @close="isModalOpen = false">
        <div
            class="flex flex-col justify-center items-center text-center p-6 w-full space-y-6"
        >
            <Icon name="alert" class="h-20 w-20" />
            <h3>Are you sure? This action is irreversible!</h3>
            <p class="mt-2 text-slate-300">
                You are about to restore a backup. This will delete all your
                current data and replace it with the data from the backup.
            </p>
            <div class="grid grid-cols-2 space-x-3 w-full">
                <button
                    class="py-2.5 rounded-lg bg-spacex-2 focus:ring-2 focus:ring-white"
                    @click="isModalOpen = false"
                >
                    Cancel
                </button>
                <button
                    :class="`py-2.5 rounded-lg bg-spacex-primary focus:ring-2 focus:ring-white ${
                        isRestoring && 'opacity-50 cursor-not-allowed'
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
        class="h-[176px] flex flex-col items-center justify-center p-4 bg-spacex-2 rounded-lg relative hover:ring-2 hover:ring-spacex-primary transition-all duration-300"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @touchstart="onMouseEnter"
        @touchend="onMouseLeave"
    >
        <div class="flex flex-col items-center mt-5 w-full h-full">
            <Icon name="file-archive" class="text-4xl" />
            <h6 class="mt-1.5 text-slate-400">{{ data.id }}</h6>

            <div class="flex items-center justify-center gap-2 mt-1">
                <span class="text-slate-400 text-sm">{{
                    data.size.formatted
                }}</span>
                <span class="text-slate-400 text-sm">-</span>
                <span class="text-slate-400 text-sm">
                    {{ new Date(data.date).toLocaleString() }}
                </span>
            </div>
        </div>
        <div
            :id="`${data.id}-controls`"
            class="absolute bottom-0 bg-spacex-2 w-full border-t-spacex-primary border-t-2 px-3 py-2 items-center justify-center gap-4 rounded-b-md hidden"
        >
            <button
                :class="`text-slate-400 p-2 rounded-lg hover:bg-spacex-primary hover:text-white ring-1 ring-spacex-primary transition-colors duration-300 ${
                    isRestoring && 'opacity-50 cursor-not-allowed'
                }`"
                aria-label="Restore from backup"
                :disabled="isRestoring"
                @click="isModalOpen = true"
            >
                <Icon name="restore" />
            </button>
            <button
                class="text-slate-400 p-2 rounded-lg hover:bg-spacex-primary hover:text-white ring-1 ring-spacex-primary transition-colors duration-300"
                aria-label="Download backup"
                @click="handleDownload"
            >
                <Icon name="download" />
            </button>
            <button
                :class="`text-slate-400 p-2 rounded-lg hover:bg-spacex-primary hover:text-white ring-1 ring-spacex-primary transition-colors duration-300 ${
                    isDeleting && 'opacity-50 cursor-not-allowed'
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
import { API_URL } from '@/constants';
import type { Backup } from '@/types';

const { data } = defineProps<{
    data: Backup;
}>();
const store = useBackupsStore();

const isDeleting = ref(false);
const isRestoring = ref(false);
const isModalOpen = ref(false);

const onMouseEnter = () => {
    const element = document.getElementById(`${data.id}-controls`)!;

    gsap.fromTo(
        element,
        {
            opacity: 0,
            display: 'none',
            y: 5,
        },
        {
            opacity: 1,
            display: 'flex',
            duration: 0.2,
            y: 0,
        },
    );
};

const onMouseLeave = () => {
    const element = document.getElementById(`${data.id}-controls`)!;

    gsap.fromTo(
        element,
        {
            opacity: 1,
            display: 'flex',
        },
        {
            opacity: 0,
            display: 'none',
            duration: 0.2,
            y: 5,
        },
    );
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
        `${API_URL}/backups/${data.id}?token=${useCookie('token').value}`,
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
