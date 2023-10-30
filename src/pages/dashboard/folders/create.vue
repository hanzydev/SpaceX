<template>
    <GoBack to="/dashboard/folders" />
    <div
        class="absolute flex min-h-screen w-full flex-col items-center justify-center bg-spacex-5 p-4"
    >
        <form
            class="flex w-[30rem] flex-col rounded-xl bg-spacex-4 p-10 max-sm:w-80"
            @submit.prevent="handleCreate"
        >
            <h1 class="mx-auto max-sm:!text-3xl">Create Folder</h1>

            <div class="mt-7 flex flex-col">
                <label class="text-sm font-semibold uppercase text-slate-300"
                    >Name</label
                >
                <input
                    v-model="name"
                    type="text"
                    placeholder="Enter Name"
                    :class="`mt-1 h-10 rounded-lg bg-spacex-2 px-3 py-2 placeholder-slate-300 outline-none focus:ring-2 focus:ring-spacex-primary ${
                        isCreating && 'cursor-not-allowed'
                    }`"
                    :disabled="isCreating"
                />
            </div>

            <button
                :class="`mt-8 flex items-center justify-center rounded-lg bg-spacex-primary px-4 py-2 text-center outline-none ring-white focus:ring-2 ${
                    isCreating && 'cursor-not-allowed opacity-50'
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
