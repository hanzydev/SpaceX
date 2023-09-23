<template>
    <GoBack to="/dashboard/folders" />
    <div
        class="flex flex-col items-center absolute justify-center min-h-screen w-full p-4 bg-spacex-5"
    >
        <form
            class="flex flex-col bg-spacex-4 p-10 max-sm:w-80 w-[30rem] rounded-xl"
            @submit.prevent="handleCreate"
        >
            <h1 class="mx-auto max-sm:!text-3xl">Create Folder</h1>

            <div class="mt-7 flex flex-col">
                <label class="font-semibold uppercase text-slate-300 text-sm"
                    >Name</label
                >
                <input
                    v-model="name"
                    type="text"
                    placeholder="Enter Name"
                    :class="`h-10 mt-1 py-2 px-3 bg-spacex-2 rounded-lg outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300 ${
                        isCreating && 'cursor-not-allowed'
                    }`"
                    :disabled="isCreating"
                />
            </div>

            <button
                :class="`mt-8 py-2 px-4 bg-spacex-primary rounded-lg outline-none focus:ring-2 ring-white flex items-center justify-center text-center ${
                    isCreating && 'opacity-50 cursor-not-allowed'
                }`"
                :disabled="isCreating"
            >
                <span v-if="!isCreating">Create Folder</span>
                <Spinner v-else :size="24" color="#fff" />
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { fire } from '@/util/toast';

const router = useRouter();

const isCreating = ref(false);
const name = ref('');

const handleCreate = async () => {
    isCreating.value = true;

    const json = await useAPI('/folders', {
        method: 'POST',
        body: {
            name: name.value,
        },
        auth: true,
    });

    if (json?.error) {
        isCreating.value = false;

        fire(json.error, {
            type: 'error',
        });
    } else {
        await router.push(`/dashboard/folders/${json.id}/update-uploads`);

        fire('Folder has been created successfully!', {
            type: 'success',
        });
    }
};

definePageMeta({
    layout: 'auth-check',
});

useHead({
    title: 'Create Folder',
    meta: [
        {
            name: 'og:title',
            content: 'Create Folder | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
