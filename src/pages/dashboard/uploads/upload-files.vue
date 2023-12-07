<template>
    <h2>Upload Files</h2>
    <Modal :is-open="isModalOpened" @close="isModalOpened = false">
        <div class="flex w-full flex-col justify-center p-4 md:p-8">
            <h2>Upload Settings</h2>
            <div
                v-if="files[currentModal!]!.type.startsWith('image/')"
                class="mt-7 flex flex-col rounded-lg bg-spacex-3 p-4"
            >
                <p class="text-sm font-semibold uppercase text-slate-300">
                    IMAGE QUALITY PERCENTAGE (CURRENTLY %{{
                        uploadSettings[currentModal!]!.quality
                    }})
                </p>
                <input
                    v-model="uploadSettings[currentModal!]!.quality"
                    class="mt-4"
                    type="range"
                    :min="1"
                    :max="100"
                />
            </div>

            <div class="mt-7 flex flex-col rounded-lg bg-spacex-3 p-4">
                <p class="text-sm font-semibold uppercase text-slate-300">
                    DELETE AFTER VIEWS (0 = NEVER DELETE)
                </p>
                <div class="relative mt-4">
                    <input
                        v-model="
                            uploadSettings[currentModal!]!.deleteAfterViews
                        "
                        class="h-10 w-full rounded-md bg-spacex-2 px-3 py-2 placeholder-slate-300 outline-none focus:ring-2 focus:ring-spacex-primary"
                        type="number"
                        :min="0"
                        :max="100000"
                    />
                    <div
                        class="absolute right-0 top-0 flex h-full flex-col items-center justify-center rounded-r-md bg-spacex-1"
                    >
                        <button
                            class="flex w-6 items-center justify-center rounded-tr-md p-1 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
                            @click="
                                uploadSettings[
                                    currentModal!
                                ]!.deleteAfterViews = (
                                    +uploadSettings[currentModal!]!
                                        .deleteAfterViews + 1
                                ).toString()
                            "
                        >
                            <Icon name="chevron-up" class="text-xs" />
                        </button>
                        <button
                            class="flex w-6 items-center justify-center rounded-br-md p-1 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
                            @click="
                                uploadSettings[
                                    currentModal!
                                ]!.deleteAfterViews = (
                                    +uploadSettings[currentModal!]!
                                        .deleteAfterViews - 1
                                ).toString()
                            "
                        >
                            <Icon name="chevron-down" class="text-xs" />
                        </button>
                    </div>
                </div>
            </div>

            <div class="mt-7 flex w-fit items-center gap-2">
                <Switch
                    v-model:is-checked="uploadSettings[currentModal!]!.private"
                />
                <h6>Make file private</h6>
            </div>
        </div>
    </Modal>
    <div class="mt-6 flex w-full flex-col rounded-md">
        <div
            :class="`relative h-32 w-full items-center overflow-hidden rounded-lg border-2 border-dotted border-spacex-primary shadow-md ${
                isUploading && 'opacity-50'
            }`"
        >
            <input
                type="file"
                :class="`absolute z-10 h-full w-full opacity-0 ${
                    isUploading ? 'cursor-not-allowed' : 'cursor-pointer'
                }`"
                multiple
                :disabled="isUploading"
                @change="onFileUpload"
            />
            <div
                class="z-1 absolute top-0 flex h-full w-full items-center justify-center bg-spacex-3"
            >
                <div class="flex flex-col items-center text-center">
                    <Icon name="upload2" class="text-4xl" />
                    <h4>Drag and drop files here</h4>
                </div>
            </div>
        </div>
        <div class="mt-4 flex flex-col gap-2">
            <div
                v-for="(file, index) in files"
                :key="index"
                class="flex w-full items-center justify-between rounded-lg bg-spacex-3 p-3"
            >
                <div class="flex items-center gap-3">
                    <div class="relative h-12 w-12">
                        <img
                            v-if="file.type.includes('image')"
                            class="h-full w-full rounded-md"
                            :src="getFileURL(file)"
                            :alt="file.name"
                        />

                        <div
                            v-else-if="file.type.includes('video')"
                            class="flex h-full w-full items-center justify-center"
                        >
                            <video
                                :src="getFileURL(file)"
                                class="h-full w-full"
                                loop
                                muted
                            />
                        </div>

                        <div
                            v-else
                            class="flex h-full w-full items-center justify-center"
                        >
                            <Icon
                                v-if="file.type.includes('audio')"
                                name="file-audio"
                                class="text-3xl"
                            />
                            <Icon
                                v-else-if="
                                    file.type.includes('text') ||
                                    [
                                        'json',
                                        'xml',
                                        'csv',
                                        'html',
                                        'css',
                                        'js',
                                        'md',
                                        'txt',
                                    ].includes(file.name.split('.').pop() ?? '')
                                "
                                name="file-text"
                                class="text-3xl"
                            />
                            <Icon
                                v-else-if="
                                    [
                                        'zip',
                                        'rar',
                                        '7z',
                                        'tar',
                                        'gz',
                                        'bin',
                                    ].includes(file.name.split('.').pop() ?? '')
                                "
                                name="file-archive"
                                class="text-3xl"
                            />
                            <Icon v-else name="file-unknown" class="text-3xl" />
                        </div>
                    </div>
                    <h6>{{ file.name }}</h6>
                </div>
                <div class="flex items-center space-x-0.5">
                    <button
                        :class="`mr-2 rounded-md bg-spacex-2 p-2 text-slate-400 transition-colors duration-300 hover:text-spacex-primary focus:ring-2 focus:ring-spacex-primary ${
                            isUploading && 'cursor-not-allowed opacity-50'
                        }`"
                        aria-label="Upload settings"
                        :disabled="isUploading"
                        @click="handleUploadSettings(index)"
                    >
                        <Icon name="settings" />
                    </button>
                    <button
                        :class="`mr-2 rounded-md bg-spacex-2 p-2 text-slate-400 transition-colors duration-300 hover:text-red-500 focus:ring-2 focus:ring-spacex-primary ${
                            isUploading && 'cursor-not-allowed opacity-50'
                        }`"
                        aria-label="Delete file"
                        :disabled="isUploading"
                        @click="handleFileDelete(index)"
                    >
                        <Icon name="trash" />
                    </button>
                </div>
            </div>
        </div>
        <div class="mt-4 h-5 w-full rounded-md bg-spacex-2">
            <div
                class="flex h-full items-center justify-between rounded-md bg-spacex-primary transition-all duration-300"
                :style="{
                    width: `${uploadProgress}%`,
                }"
            >
                <Transition>
                    <p
                        v-if="uploadProgress"
                        class="ml-auto px-2 text-center text-sm font-medium text-white"
                    >
                        {{ uploadProgress.toFixed(2) }}%
                    </p>
                </Transition>
            </div>
        </div>
        <button
            :class="`mt-4 flex h-10 items-center justify-center gap-4 rounded-lg bg-spacex-primary text-center text-white transition-all duration-300 ${
                isUploading && 'cursor-not-allowed opacity-50'
            }`"
            :disabled="isUploading"
            @click="uploadFiles"
        >
            <span v-if="!isUploading"
                >Upload Files ({{ files.length }} files)</span
            >
            <Spinner v-else :size="24" color="#fff" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { CHUNK_SIZE_IN_MB } from '@/constants';
import { fire } from '@/util/toast';

const isModalOpened = ref(false);
const isUploading = ref(false);
const uploadProgress = ref(0);

const files = ref<File[]>([]);
const currentModal = ref<number>();
const uploadSettings = reactive<{
    [index: number]: {
        private: boolean;
        deleteAfterViews: string;
        quality?: string;
    };
}>({});

watch(uploadSettings, (settings) => {
    const newSettings = { ...settings };

    Object.entries(newSettings).forEach(([key, value]) => {
        if (+value.deleteAfterViews > 100000) {
            newSettings[key as never].deleteAfterViews = '100000';
        } else if (
            value.deleteAfterViews === '' ||
            +value.deleteAfterViews < 0
        ) {
            newSettings[key as never].deleteAfterViews = '0';
        }
    });
});

const handleUploadSettings = (index: number) => {
    if (!uploadSettings[index]) {
        uploadSettings[index] = {
            private: false,
            deleteAfterViews: '0',
        };
    }

    if (files.value[index].type.startsWith('image/')) {
        if (!('quality' in uploadSettings[index])) {
            uploadSettings[index].quality = '100';
        }
    }

    currentModal.value = index;
    isModalOpened.value = true;
};

const handleFileDelete = (index: number) => {
    if (currentModal.value === index) {
        isModalOpened.value = false;
    }

    files.value.splice(index, 1);
};

const onFileUpload = (e: any) => {
    files.value = [...files.value, ...Array.from<File>(e.target.files ?? [])];
};

const uploadFiles = async () => {
    if (files.value.length) {
        isUploading.value = true;

        let currentIndex = 0;
        let doneRight = 0;

        const allChunks = unref(files).reduce(
            (acc, file) =>
                acc + Math.ceil(file.size / (CHUNK_SIZE_IN_MB * 1024 * 1024)),
            0,
        );

        for (const file of files.value) {
            const totalChunks = Math.ceil(
                file.size / (CHUNK_SIZE_IN_MB * 1024 * 1024),
            );

            let errorOccurred = false;

            for (let i = 0; i < totalChunks; i++) {
                const fileReader = new FileReader();

                const start = i * CHUNK_SIZE_IN_MB * 1024 * 1024;
                const end = Math.min(
                    file.size,
                    (i + 1) * CHUNK_SIZE_IN_MB * 1024 * 1024,
                );

                fileReader.readAsArrayBuffer(file.slice(start, end));

                await new Promise<void>((resolve) => {
                    fileReader.onload = async () => {
                        const buffer = Buffer.from(
                            fileReader.result as ArrayBuffer,
                        );

                        const formData = new FormData();

                        formData.append(
                            'file',
                            new Blob([buffer], { type: file.type }),
                            file.name,
                        );

                        formData.append('currentChunk', (i + 1).toString());
                        formData.append('totalChunks', totalChunks.toString());

                        if (uploadSettings[currentIndex]) {
                            for (const [key, value] of Object.entries(
                                uploadSettings[currentIndex],
                            )) {
                                formData.append(key, value.toString());
                            }
                        }

                        const json = await useAPI('/uploads', {
                            method: 'POST',
                            body: formData,
                            auth: true,
                            retry: 3,
                        });

                        if (json?.error) {
                            errorOccurred = true;

                            fire(json.error, {
                                type: 'error',
                                autoClose: 2000,
                            });
                        }

                        resolve();
                    };
                });

                if (errorOccurred) {
                    break;
                }

                uploadProgress.value = (100 * ++doneRight) / allChunks;
            }

            delete uploadSettings[currentIndex];
            files.value = files.value.filter((f) => f.name !== file.name);

            currentIndex++;
        }

        currentIndex = 0;
        isUploading.value = false;
        files.value = [];
        uploadProgress.value = 0;

        fire('Files has been uploaded successfully!', {
            type: 'success',
        });
    } else {
        fire('Please select at least one file!', {
            type: 'error',
        });
    }
};

const getFileURL = (file: File) => {
    return URL.createObjectURL(file);
};

definePageMeta({
    layout: 'dashboard',
});

useHead({
    title: 'Upload Files',
    meta: [
        {
            name: 'og:title',
            content: 'Upload Files | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
    @apply transition-opacity duration-500 ease-in-out;
}

.v-enter-from,
.v-leave-to {
    @apply opacity-0;
}
</style>
