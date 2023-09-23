<template>
    <h2>Backups</h2>
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
                    class="py-2.5 rounded-lg bg-spacex-primary focus:ring-2 focus:ring-white"
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
            <div class="grid grid-cols-2 w-full max-sm:grid-cols-1 gap-2 mt-6">
                <button
                    :class="`h-10 px-4 bg-spacex-primary rounded-lg outline-none flex items-center justify-center text-center ${
                        isCreating && 'opacity-50 cursor-not-allowed'
                    }`"
                    :disabled="isCreating"
                    @click="createBackup"
                >
                    <span v-if="!isCreating">Create Backup</span>
                    <Spinner v-else :size="24" color="#fff" />
                </button>
                <div class="relative w-full flex flex-col">
                    <button
                        :class="`h-10 px-4 bg-spacex-primary rounded-lg outline-none flex items-center justify-center text-center ${
                            isRestoring && 'opacity-50'
                        }`"
                        :disabled="isRestoring"
                    >
                        <span v-if="!isRestoring">Restore From Backup</span>
                        <Spinner v-else :size="24" color="#fff" />
                    </button>
                    <input
                        type="file"
                        accept=".tar.gz"
                        :class="`h-full w-full opacity-0 z-10 absolute ${
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

    const backupFile = files.value.find(
        (file) =>
            file.name.endsWith('.tar.gz') &&
            file.type.includes('application/x-gzip'),
    );

    if (!backupFile) {
        isRestoring.value = false;

        return fire('Please select a valid backup file!', {
            type: 'error',
        });
    }

    const totalChunks = Math.ceil(
        backupFile.size / (CHUNK_SIZE_IN_MB * 1024 * 1024),
    );

    for (let i = 0; i < totalChunks; i++) {
        const fileReader = new FileReader();

        const start = i * CHUNK_SIZE_IN_MB * 1024 * 1024;
        const end = Math.min(
            backupFile.size,
            (i + 1) * CHUNK_SIZE_IN_MB * 1024 * 1024,
        );

        fileReader.readAsArrayBuffer(backupFile.slice(start, end));

        let errorOccurred = false;

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

                const json = await useAPI('/backups', {
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

    fire('Backup has been restored successfully!', {
        type: 'success',
    });
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
