<template>
    <div
        class="flex flex-col items-center absolute justify-center min-h-screen w-full p-4 bg-spacex-5"
    >
        <GoBack to="/dashboard/notes" />
        <form
            class="flex flex-col bg-spacex-4 p-10 max-sm:w-80 max-lg:w-[30rem] w-[50rem] rounded-xl"
            @submit.prevent="handleEdit"
        >
            <h1 class="mx-auto max-sm:!text-3xl">Edit Note</h1>

            <div class="mt-7 flex flex-col">
                <label class="font-semibold uppercase text-slate-300 text-sm"
                    >Title</label
                >
                <input
                    v-model="note.title"
                    type="text"
                    placeholder="Enter Title"
                    :class="`h-10 mt-1 py-2 px-3 bg-spacex-2 rounded-lg outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300 ${
                        isEditing && 'cursor-not-allowed'
                    }`"
                    :disabled="isEditing"
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
                        isEditing && 'cursor-not-allowed'
                    }`"
                    :rows="note.content.split('\n').length"
                    :disabled="isEditing"
                />
            </div>

            <button
                :class="`mt-8 py-2 px-4 bg-spacex-primary rounded-lg outline-none focus:ring-2 ring-white flex items-center justify-center text-center ${
                    isEditing && 'opacity-50 cursor-not-allowed'
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
