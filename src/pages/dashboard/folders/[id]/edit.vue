<template>
    <GoBack to="/dashboard/folders" />
    <div
        class="flex flex-col items-center absolute justify-center min-h-screen w-full p-4 bg-spacex-5"
    >
        <form
            class="flex flex-col bg-spacex-4 p-10 max-sm:w-80 w-[30rem] rounded-xl"
            @submit.prevent="handleEdit"
        >
            <h1 class="mx-auto max-sm:!text-3xl">Edit Folder</h1>

            <div class="mt-7 flex flex-col">
                <label class="font-semibold uppercase text-slate-300 text-sm"
                    >Name</label
                >
                <input
                    v-model="name"
                    type="text"
                    placeholder="Enter Name"
                    :class="`h-10 mt-1 py-2 px-3 bg-spacex-2 rounded-lg outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300 ${
                        isEditing && 'cursor-not-allowed'
                    }`"
                    :disabled="isEditing"
                />
            </div>

            <button
                :class="`mt-8 py-2 px-4 bg-spacex-primary rounded-lg outline-none focus:ring-2 ring-white flex items-center justify-center text-center ${
                    isEditing && 'opacity-50 cursor-not-allowed'
                }`"
                :disabled="isEditing"
            >
                <span v-if="!isEditing">Edit Folder</span>
                <Spinner v-else :size="24" color="#fff" />
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { fire } from '@/util/toast';
import folderEmitter from '@/util/emitters/folder';

const router = useRouter();
const route = useRoute();

const isEditing = ref(false);

const name = ref('');

const json = await useAPI(`/folders/${route.params.id}`, {
    auth: true,
});

if (json?.error) {
    throwError(404);
} else {
    name.value = json.name;

    folderEmitter.on('UPDATE_FOLDER', ({ id, name: newName }) => {
        if (id === json.id && !isEditing.value) {
            name.value = newName;
        }
    });

    folderEmitter.on('DELETE_FOLDER', (folderId) => {
        if (folderId === json.id) {
            router.push('/dashboard/folders');
        }
    });
}

const handleEdit = async () => {
    isEditing.value = true;

    const json = await useAPI(`/folders/${route.params.id}`, {
        method: 'PATCH',
        body: {
            name: name.value,
        },
        auth: true,
    });

    isEditing.value = false;

    if (json?.error) {
        fire(json.error, {
            type: 'error',
        });
    } else {
        await router.push('/dashboard/folders');

        fire('Folder has been edited successfully!', {
            type: 'success',
        });
    }
};

definePageMeta({
    layout: 'auth-check',
});

useHead({
    title: 'Edit Folder',
    meta: [
        {
            name: 'og:title',
            content: 'Edit Folder | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
