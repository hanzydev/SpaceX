<template>
    <h2>Notes</h2>
    <div class="mt-6">
        <SearchBar
            v-model:value="searchQuery"
            placeholder="Search for notes..."
        />
        <div
            :key="currentPage + searchQuery"
            class="mt-4 grid grid-cols-5 gap-4 max-[1495px]:grid-cols-4 max-[1262px]:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1"
        >
            <NoteView
                v-for="note in filtered.slice(
                    currentPage * 20,
                    currentPage * 20 + 20,
                )"
                :key="note.id"
                :data="note"
            />
        </div>
        <Paginator
            v-model:currentPage="currentPage"
            class="mt-4"
            item-name="note"
            :data="filtered"
            :items-per-page="3"
        />
    </div>
</template>

<script setup lang="ts">
import { useNotesStore } from '@/store';

const store = useNotesStore();

if (!store.notesLoaded) {
    await store.fetchNotes();
}

const searchQuery = ref('');
const currentPage = ref(0);
const filtered = ref(store.notes);
const hasItemsInCurrentPage = computed(
    () =>
        filtered.value.slice(
            currentPage.value * 20,
            currentPage.value * 20 + 20,
        ).length > 0,
);

watch(
    () => store.notes,
    (notes) => {
        filtered.value = notes.filter((note) =>
            note.title
                .toLocaleLowerCase('tr-TR')
                .includes(searchQuery.value.toLocaleLowerCase('tr-TR')),
        );

        while (!hasItemsInCurrentPage.value && currentPage.value > 0) {
            currentPage.value -= 1;
        }
    },
);

watch(searchQuery, (value) => {
    filtered.value = store.notes.filter((note) =>
        note.title
            .toLocaleLowerCase('tr-TR')
            .includes(value.toLocaleLowerCase('tr-TR')),
    );

    while (!hasItemsInCurrentPage.value && currentPage.value > 0) {
        currentPage.value -= 1;
    }
});

definePageMeta({
    layout: 'dashboard',
});

useHead({
    title: 'Notes',
    meta: [
        {
            name: 'og:title',
            content: 'Notes | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
