<template>
    <GoBack to="/dashboard/notes" />
    <div
        class="absolute flex min-h-screen w-full flex-col items-center justify-center bg-spacex-5 p-4"
    >
        <form
            class="flex w-[50rem] flex-col rounded-xl bg-spacex-4 p-10 max-lg:w-[30rem] max-sm:w-80"
            @submit.prevent="handleCreate"
        >
            <h1 class="mx-auto max-sm:!text-3xl">Create Note</h1>

            <div class="mt-7 flex flex-col">
                <label class="text-sm font-semibold uppercase text-slate-300"
                    >Title</label
                >
                <input
                    v-model="note.title"
                    type="text"
                    placeholder="Enter Title"
                    :class="`mt-1 h-10 rounded-lg bg-spacex-2 px-3 py-2 placeholder-slate-300 outline-none focus:ring-2 focus:ring-spacex-primary ${
                        isCreating && 'cursor-not-allowed'
                    }`"
                    :disabled="isCreating"
                />
            </div>
            <div class="mt-3 flex flex-col">
                <label class="text-sm font-semibold uppercase text-slate-300"
                    >Content</label
                >
                <textarea
                    v-model="note.content"
                    placeholder="Enter Content"
                    wrap="hard"
                    :class="`mt-1 min-h-[40px] resize-none rounded-lg bg-spacex-2 px-3 py-2.5 placeholder-slate-300 outline-none focus:ring-2 focus:ring-spacex-primary ${
                        isCreating && 'cursor-not-allowed'
                    }`"
                    :rows="note.content.split('\n').length"
                    :disabled="isCreating"
                />
            </div>

            <button
                :class="`mt-8 flex items-center justify-center rounded-lg bg-spacex-primary px-4 py-2 text-center outline-none ring-white focus:ring-2 ${
                    isCreating && 'cursor-not-allowed opacity-50'
                }`"
                :disabled="isCreating"
            >
                <span v-if="!isCreating">Create Note</span>
                <Spinner v-else :size="24" color="#fff" />
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { fire } from '@/util/toast';

const router = useRouter();

const note = reactive({
    title: '',
    content: '',
});

const isCreating = ref(false);

const handleCreate = async () => {
    isCreating.value = true;

    const json = await useAPI('/notes', {
        method: 'POST',
        body: note,
        auth: true,
    });

    if (json?.error) {
        isCreating.value = false;

        fire(json.error, {
            type: 'error',
        });
    } else {
        await router.push('/dashboard/notes');

        fire('Note has been created successfully!', {
            type: 'success',
        });
    }
};

definePageMeta({
    layout: 'auth-check',
});

useHead({
    title: 'Create Note',
    meta: [
        {
            name: 'og:title',
            content: 'Create Note | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
