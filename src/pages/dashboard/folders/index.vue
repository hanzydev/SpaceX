<template>
    <h2>Folders</h2>
    <div class="mt-6">
        <SearchBar
            v-model:value="searchQuery"
            placeholder="Search for folders..."
        />
        <div
            :key="currentPage + searchQuery"
            class="mt-4 grid grid-cols-5 gap-4 max-[1495px]:grid-cols-4 max-[1262px]:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1"
        >
            <FolderView
                v-for="folder in filtered.slice(
                    currentPage * 20,
                    currentPage * 20 + 20,
                )"
                :key="folder.id"
                :data="folder"
            />
        </div>
        <Paginator
            v-model:currentPage="currentPage"
            class="mt-4"
            item-name="folder"
            :data="filtered"
        />
    </div>
</template>

<script setup lang="ts">
import { useFoldersStore } from '~/store';

const store = useFoldersStore();

if (!store.foldersLoaded) {
    await store.fetchFolders();
}

const searchQuery = ref('');
const currentPage = ref(0);
const filtered = ref(store.folders);
const hasItemsInCurrentPage = computed(
    () =>
        filtered.value.slice(
            currentPage.value * 20,
            currentPage.value * 20 + 20,
        ).length > 0,
);

watch(
    () => store.folders,
    (folders) => {
        filtered.value = folders.filter((folder) =>
            folder.name
                .toLocaleLowerCase('tr-TR')
                .includes(searchQuery.value.toLocaleLowerCase('tr-TR')),
        );

        while (!hasItemsInCurrentPage.value && currentPage.value > 0) {
            currentPage.value -= 1;
        }
    },
);

watch(searchQuery, (value) => {
    filtered.value = store.folders.filter((folder) =>
        folder.name
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
    title: 'Folders',
    meta: [
        {
            name: 'og:title',
            content: 'Folders | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
