<template>
    <h2>Backups</h2>
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
                    class="rounded-lg bg-spacex-primary py-2.5 focus:ring-2 focus:ring-white"
                    :disabled="isRestoring"
                    @click="restoreFromBackup"
                >
                    Restore
                </button>
            </div>
        </div>
    </Modal>
    <div class="mt-6">
        <div class="rounded-xl bg-spacex-3 p-4">
            <h3>Archives</h3>
            <BackupsArchives />
        </div>
        <div class="mt-6 rounded-xl bg-spacex-3 p-4">
            <h3>Operations</h3>
            <div class="mt-6 grid w-full grid-cols-2 gap-2 max-sm:grid-cols-1">
                <button
                    :class="`flex h-10 items-center justify-center rounded-lg bg-spacex-primary px-4 text-center outline-none ${
                        isCreating && 'cursor-not-allowed opacity-50'
                    }`"
                    :disabled="isCreating"
                    @click="createBackup"
                >
                    <span v-if="!isCreating">Create Backup</span>
                    <Spinner v-else :size="24" color="#fff" />
                </button>
                <div class="relative flex w-full flex-col">
                    <button
                        :class="`flex h-10 items-center justify-center rounded-lg bg-spacex-primary px-4 text-center outline-none ${
                            isRestoring && 'opacity-50'
                        }`"
                        :disabled="isRestoring"
                    >
                        <span v-if="!isRestoring">Restore From Backup</span>
                        <Spinner v-else :size="24" color="#fff" />
                    </button>
                    <input
                        type="file"
                        accept=".tar.gz,.tgz,.gz"
                        :class="`absolute z-10 h-full w-full opacity-0 ${
                            isRestoring
                                ? 'cursor-not-allowed'
                                : 'cursor-pointer'
                        }`"
                        :disabled="isRestoring"
                        @change="onFileUpload"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { fire, update } from '@/util/toast';
import { useBackupsStore } from '@/store';
import { CHUNK_SIZE_IN_MB } from '@/constants';

const store = useBackupsStore();

if (!store.backupsLoaded) {
    await store.fetchBackups();
}

const files = ref<File[]>([]);
const isRestoring = ref(false);
const isCreating = ref(false);
const isModalOpen = ref(false);

const onFileUpload = (e: any) => {
    files.value = Array.from<File>(e.target.files!);
    isModalOpen.value = true;
};

const restoreFromBackup = async () => {
    isRestoring.value = true;
    isModalOpen.value = false;

    const backupFile = files.value[0];

    if (!backupFile) {
        isRestoring.value = false;

        return fire('Please select a backup file!', {
            type: 'error',
        });
    }

    const totalChunks = Math.ceil(
        backupFile.size / (CHUNK_SIZE_IN_MB * 1024 * 1024),
    );

    let errorOccurred = false;

    for (let i = 0; i < totalChunks; i++) {
        const fileReader = new FileReader();

        const start = i * CHUNK_SIZE_IN_MB * 1024 * 1024;
        const end = Math.min(
            backupFile.size,
            (i + 1) * CHUNK_SIZE_IN_MB * 1024 * 1024,
        );

        fileReader.readAsArrayBuffer(backupFile.slice(start, end));

        await new Promise<void>((resolve) => {
            fileReader.onload = async () => {
                const buffer = Buffer.from(fileReader.result as ArrayBuffer);

                const toast = fire(
                    `Uploading backup file...<p class="mt-1">(${
                        i + 1
                    }/${totalChunks})</p>`,
                    {
                        isLoading: true,
                        autoClose: false,
                    },
                );

                const formData = new FormData();

                formData.append(
                    'file',
                    new Blob([buffer], { type: backupFile.type }),
                    backupFile.name,
                );

                formData.append('currentChunk', (i + 1).toString());
                formData.append('totalChunks', totalChunks.toString());

                const json = await useAPI('/backups/', {
                    method: 'PUT',
                    body: formData,
                    auth: true,
                    retry: 3,
                });

                if (json?.error) {
                    errorOccurred = true;
                }

                update(toast, {
                    type: json?.error ? 'error' : 'success',
                    render() {
                        return h('div', {
                            innerHTML: json?.error
                                ? json?.error
                                : `Uploaded backup file. <p class="mt-1">(${
                                      i + 1
                                  }/${totalChunks})</p>`,
                        });
                    },
                    autoClose: 2000,
                    isLoading: false,
                });

                resolve();
            };
        });

        if (errorOccurred) {
            break;
        }
    }

    isRestoring.value = false;
    files.value = [];

    if (!errorOccurred) {
        fire('Backup has been restored successfully!', {
            type: 'success',
        });
    }
};

const createBackup = async () => {
    isCreating.value = true;

    const json = await useAPI('/backups', {
        method: 'POST',
        auth: true,
    });

    isCreating.value = false;

    if (json?.error) {
        return fire(json.error, {
            type: 'error',
        });
    } else {
        fire("Backup creation started. It'll take a few minutes to complete.", {
            type: 'success',
        });
    }
};

definePageMeta({
    layout: 'dashboard',
});

useHead({
    title: 'Backups',
    meta: [
        {
            name: 'og:title',
            content: 'Backups | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
