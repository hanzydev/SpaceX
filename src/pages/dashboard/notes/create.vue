<template>
    <GoBack to="/dashboard/notes" />
    <div
        class="flex flex-col items-center absolute justify-center min-h-screen w-full p-4 bg-spacex-5"
    >
        <form
            class="flex flex-col bg-spacex-4 p-10 max-sm:w-80 max-lg:w-[30rem] w-[50rem] rounded-xl"
            @submit.prevent="handleCreate"
        >
            <h1 class="mx-auto max-sm:!text-3xl">Create Note</h1>

            <div class="mt-7 flex flex-col">
                <label class="font-semibold uppercase text-slate-300 text-sm"
                    >Title</label
                >
                <input
                    v-model="note.title"
                    type="text"
                    placeholder="Enter Title"
                    :class="`h-10 mt-1 py-2 px-3 bg-spacex-2 rounded-lg outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300 ${
                        isCreating && 'cursor-not-allowed'
                    }`"
                    :disabled="isCreating"
                />
            </div>
            <div class="mt-3 flex flex-col">
                <label class="font-semibold uppercase text-slate-300 text-sm"
                    >Content</label
                >
                <textarea
                    v-model="note.content"
                    placeholder="Enter Content"
                    wrap="hard"
                    :class="`mt-1 py-2.5 px-3 min-h-[40px] bg-spacex-2 rounded-lg outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300 resize-none ${
                        isCreating && 'cursor-not-allowed'
                    }`"
                    :rows="note.content.split('\n').length"
                    :disabled="isCreating"
                />
            </div>

            <button
                :class="`mt-8 py-2 px-4 bg-spacex-primary rounded-lg outline-none focus:ring-2 ring-white flex items-center justify-center text-center ${
                    isCreating && 'opacity-50 cursor-not-allowed'
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
