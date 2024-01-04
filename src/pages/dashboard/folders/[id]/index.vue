<template>
    <h2>Uploads for {{ folder!.name }}</h2>
    <Uploads
        :key="folder!.uploads.length"
        class="mt-6"
        :filter="(u) => folder!.uploads.includes(u.id)"
        :parent-folder="folder!.id"
    />
</template>

<script setup lang="ts">
import { useUploadsStore } from '@/store';
import type { Folder } from '@/types';
import folderEmitter from '@/util/emitters/folder';

const router = useRouter();
const route = useRoute();

const isLoaded = ref(false);
const folder = ref<Folder>();

const store = useUploadsStore();

if (!store.uploadsLoaded) {
    await store.fetchUploads();
}

const json = await useAPI(`/folders/${route.params.id}`, {
    auth: true,
});

if (json?.error) {
    throwError(404);
} else {
    isLoaded.value = true;
    folder.value = json;

    folderEmitter.on('ADD_UPLOAD_TO_FOLDER', ({ folderId, uploadId }) => {
        if (folderId === json.id) {
            folder.value!.uploads.push(uploadId);
        }
    });

    folderEmitter.on('REMOVE_UPLOAD_FROM_FOLDER', ({ folderId, uploadId }) => {
        if (folderId === json.id) {
            folder.value!.uploads = folder.value!.uploads.filter(
                (upload) => upload !== uploadId,
            );
        }
    });

    folderEmitter.on('BULK_UPDATE_FOLDER_UPLOADS', ({ id, uploads }) => {
        if (id === json.id) {
            folder.value!.uploads = uploads;
        }
    });

    folderEmitter.on('DELETE_FOLDER', (folderId) => {
        if (folderId === json.id) {
            router.push('/dashboard/folders');
        }
    });
}

definePageMeta({
    layout: 'dashboard',
});

useHead({
    title: `Uploads for ${folder.value!.name}`,
    meta: [
        {
            name: 'og:title',
            content: `Uploads for ${folder.value!.name} | SpaceX`,
        },
    ],
});
</script>
