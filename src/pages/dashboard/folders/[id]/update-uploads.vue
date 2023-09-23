<template>
    <div
        class="flex flex-col items-center absolute justify-center min-h-screen w-full p-4 bg-spacex-5 md:px-24 lg:px-32"
    >
        <GoBack to="/dashboard/folders" />
        <h1>Update Folder Uploads</h1>
        <div class="mt-7 bg-spacex-4 p-4 rounded-xl w-full">
            <SearchBar
                v-model:value="searchQuery"
                placeholder="Search for uploads..."
            />
            <div
                :key="currentPage + searchQuery"
                class="grid max-sm:grid-cols-1 max-md:grid-cols-2 max-[1262px]:grid-cols-3 max-[1495px]:grid-cols-4 grid-cols-5 gap-4 mt-4"
            >
                <UploadView
                    v-for="upload in filtered.slice(
                        currentPage * 20,
                        currentPage * 20 + 20,
                    )"
                    :key="upload.id"
                    :data="upload"
                    :always-ring="uploads.includes(upload.id)"
                    :on-click="
                        () =>
                            uploads.includes(upload.id)
                                ? (uploads = uploads.filter(
                                      (id) => id !== upload.id,
                                  ))
                                : uploads.push(upload.id)
                    "
                />
            </div>
            <Paginator
                v-model:currentPage="currentPage"
                class="mt-4"
                item-name="upload"
                :data="filtered"
            />
            <button
                type="button"
                :class="`mt-10 py-2 px-4 w-full bg-spacex-primary rounded-lg outline-none focus:ring-2 ring-white flex items-center justify-center text-center ${
                    isUpdating && 'opacity-50 cursor-not-allowed'
                }`"
                :disabled="isUpdating"
                @click="handleBulkUpdate"
            >
                <span v-if="!isUpdating">Update Uploads</span>
                <Spinner v-else :size="24" color="#fff" />
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useUploadsStore } from '@/store';
import { fire } from '@/util/toast';
import folderEmitter from '@/util/emitters/folder';

const router = useRouter();
const route = useRoute();
const store = useUploadsStore();

if (!store.uploadsLoaded) {
    await store.fetchUploads();
}

const isUpdating = ref(false);

const searchQuery = ref('');
const currentPage = ref(0);
const filtered = ref(store.uploads);
const hasItemsInCurrentPage = computed(
    () =>
        filtered.value.slice(
            currentPage.value * 20,
            currentPage.value * 20 + 20,
        ).length > 0,
);

const uploads = ref<string[]>([]);

const json = await useAPI(`/folders/${route.params.id}`, {
    auth: true,
});

if (json?.error) {
    throwError(404);
} else {
    uploads.value = json.uploads;

    folderEmitter.on('ADD_UPLOAD_TO_FOLDER', ({ folderId, uploadId }) => {
        if (folderId === json.id && !isUpdating.value) {
            uploads.value.push(uploadId);
        }
    });

    folderEmitter.on('REMOVE_UPLOAD_FROM_FOLDER', ({ folderId, uploadId }) => {
        if (folderId === json.id && !isUpdating.value) {
            uploads.value = uploads.value.filter(
                (upload) => upload !== uploadId,
            );
        }
    });

    folderEmitter.on(
        'BULK_UPDATE_FOLDER_UPLOADS',
        ({ id, uploads: newUploads }) => {
            if (id === json.id && !isUpdating.value) {
                uploads.value = newUploads;
            }
        },
    );

    folderEmitter.on('DELETE_FOLDER', (folderId) => {
        if (folderId === json.id) {
            router.push('/dashboard/folders');
        }
    });
}

const handleBulkUpdate = async () => {
    isUpdating.value = true;

    const json = await useAPI(`/folders/${route.params.id}/uploads`, {
        method: 'PUT',
        body: {
            uploads: uploads.value,
        },
        auth: true,
    });

    isUpdating.value = false;

    if (json?.error) {
        fire(json.error, {
            type: 'error',
        });
    } else {
        await router.push(`/dashboard/folders/${route.params.id}`);

        fire('Folder uploads has been bulk updated successfully!', {
            type: 'success',
        });
    }
};

watch(
    () => store.uploads,
    (uploads) => {
        filtered.value = uploads.filter((upload) =>
            upload.id
                .toLocaleLowerCase('tr-TR')
                .includes(searchQuery.value.toLocaleLowerCase('tr-TR')),
        );

        while (!hasItemsInCurrentPage.value && currentPage.value > 0) {
            currentPage.value -= 1;
        }
    },
);

watch(searchQuery, (value) => {
    filtered.value = store.uploads.filter((upload) =>
        upload.id
            .toLocaleLowerCase('tr-TR')
            .includes(value.toLocaleLowerCase('tr-TR')),
    );

    while (!hasItemsInCurrentPage.value && currentPage.value > 0) {
        currentPage.value -= 1;
    }
});

definePageMeta({
    layout: 'auth-check',
});

useHead({
    title: 'Update Folder Uploads',
    meta: [
        {
            name: 'og:title',
            content: 'Update Folder Uploads | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
