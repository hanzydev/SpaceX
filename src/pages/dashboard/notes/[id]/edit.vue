<template>
    <div
        class="absolute flex min-h-screen w-full flex-col items-center justify-center bg-spacex-5 p-4"
    >
        <GoBack to="/dashboard/notes" />
        <form
            class="flex w-[50rem] flex-col rounded-xl bg-spacex-4 p-10 max-lg:w-[30rem] max-sm:w-80"
            @submit.prevent="handleEdit"
        >
            <h1 class="mx-auto max-sm:!text-3xl">Edit Note</h1>

            <div class="mt-7 flex flex-col">
                <label class="text-sm font-semibold uppercase text-slate-300"
                    >Title</label
                >
                <input
                    v-model="note.title"
                    type="text"
                    placeholder="Enter Title"
                    :class="`mt-1 h-10 rounded-lg bg-spacex-2 px-3 py-2 placeholder-slate-300 outline-none focus:ring-2 focus:ring-spacex-primary ${
                        isEditing && 'cursor-not-allowed'
                    }`"
                    :disabled="isEditing"
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
                        isEditing && 'cursor-not-allowed'
                    }`"
                    :rows="note.content.split('\n').length"
                    :disabled="isEditing"
                />
            </div>

            <button
                :class="`mt-8 flex items-center justify-center rounded-lg bg-spacex-primary px-4 py-2 text-center outline-none ring-white focus:ring-2 ${
                    isEditing && 'cursor-not-allowed opacity-50'
                }`"
                :disabled="isEditing"
            >
                <span v-if="!isEditing">Edit Note</span>
                <Spinner v-else :size="24" color="#fff" />
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { fire } from '@/util/toast';
import noteEmitter from '@/util/emitters/note';

const router = useRouter();
const route = useRoute();

const isEditing = ref(false);

const note = reactive({
    title: '',
    content: '',
});

const json = await useAPI(`/notes/${route.params.id}`, {
    auth: true,
});

if (json?.error) {
    throwError(404);
} else {
    note.title = json.title;
    note.content = json.content;

    noteEmitter.on('UPDATE_NOTE', ({ id, title, content }) => {
        if (id === json.id && !isEditing.value) {
            note.title = title;
            note.content = content;
        }
    });

    noteEmitter.on('DELETE_NOTE', (noteId) => {
        if (noteId === json.id) {
            router.push('/dashboard/notes');
        }
    });
}

const handleEdit = async () => {
    isEditing.value = true;

    const json = await useAPI(`/notes/${route.params.id}`, {
        method: 'PATCH',
        body: note,
        auth: true,
    });

    isEditing.value = false;

    if (json?.error) {
        fire(json.error, {
            type: 'error',
        });
    } else {
        await router.push('/dashboard/notes');

        fire('Note has been edited successfully!', {
            type: 'success',
        });
    }
};

definePageMeta({
    layout: 'auth-check',
});

useHead({
    title: 'Edit Note',
    meta: [
        {
            name: 'og:title',
            content: 'Edit Note | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
