<template>
    <Modal :is-open="isModalOpen" @close="isModalOpen = false">
        <div class="flex w-full flex-col justify-center p-4">
            <h2>{{ data.title }}</h2>
            <h3 class="!mt-5">Date</h3>
            <div
                class="mt-3 flex w-full items-center gap-2 rounded-lg bg-spacex-3 p-4 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
            >
                <Icon name="calendar" class="text-2xl text-spacex-primary" />
                <h6>{{ new Date(data.date).toLocaleDateString() }}</h6>
            </div>

            <h3 class="!mt-5">Content</h3>
            <div
                class="mt-3 flex items-center gap-2 rounded-lg bg-spacex-3 p-4 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
            >
                <Icon name="book" class="text-2xl text-spacex-primary" />
                <textarea
                    :value="data.content"
                    wrap="hard"
                    class="w-full resize-none rounded-lg bg-spacex-3 text-base font-semibold placeholder-slate-300 outline-none focus:ring-2 focus:ring-spacex-primary"
                    disabled
                    :rows="data.content.split('\n').length"
                />
            </div>

            <h3 class="!mt-5">Controls</h3>
            <div
                class="mt-3 grid w-full grid-cols-2 gap-2 max-xs:grid-cols-1 md:grid-cols-3"
            >
                <button
                    class="flex w-full items-center gap-2 rounded-lg bg-spacex-3 px-3 py-2 transition-colors duration-300 hover:bg-spacex-2 focus:ring-2 focus:ring-spacex-primary"
                    @click="handleCopy"
                >
                    <Icon name="copy" />
                    <span>Copy</span>
                </button>
                <button
                    class="flex h-10 items-center gap-2 rounded-lg bg-spacex-3 px-3 py-2 transition-colors duration-300 hover:bg-spacex-2 focus:ring-2 focus:ring-spacex-primary"
                    @click="handleEdit"
                >
                    <Icon name="pen" />
                    <span>Edit</span>
                </button>
                <button
                    :class="`flex h-10 items-center gap-2 rounded-lg bg-spacex-3 px-3 py-2 transition-colors duration-300 hover:bg-spacex-2 focus:ring-2 focus:ring-spacex-primary ${
                        isDeleting && 'cursor-not-allowed opacity-50'
                    }`"
                    :disabled="isDeleting"
                    @click="handleDelete"
                >
                    <Icon v-if="!isDeleting" name="trash" />
                    <span v-if="!isDeleting">Delete</span>
                    <Spinner v-else :size="24" color="#fff" />
                </button>
            </div>
        </div>
    </Modal>
    <div
        :class="`relative flex h-16 cursor-pointer flex-col items-center justify-center rounded-lg bg-spacex-3 p-4 transition-all duration-300 ${
            isModalOpen
                ? 'ring-2 ring-spacex-primary'
                : 'hover:ring-2 hover:ring-spacex-primary'
        }`"
        @click="isModalOpen = true"
    >
        <h6 class="text-center text-slate-400">
            {{
                data.title.length > 24
                    ? `${data.title.slice(0, 24)}...`
                    : data.title
            }}
        </h6>
    </div>
</template>

<script setup lang="ts">
import { fire } from '@/util/toast';
import { useNotesStore } from '@/store';
import type { Note } from '@/types';

const { data } = defineProps<{
    data: Note;
}>();

const router = useRouter();
const store = useNotesStore();

const isDeleting = ref(false);
const isModalOpen = ref(false);

const handleCopy = async () => {
    await navigator.clipboard.writeText(data.content);

    fire('Content successfully copied to the clipboard!', {
        type: 'success',
    });
};

const handleDelete = async () => {
    isDeleting.value = true;

    const json = await store.deleteNote(data.id);
    isDeleting.value = false;

    if (json?.error) {
        fire(json.error, {
            type: 'error',
        });
    } else {
        isModalOpen.value = false;

        fire('Note has been deleted successfully!', {
            type: 'success',
        });
    }
};

const handleEdit = () => {
    router.push(`/dashboard/notes/${data.id}/edit`);
};
</script>
