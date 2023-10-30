<template>
    <h2>Codes</h2>
    <div class="mt-6">
        <SearchBar
            v-model:value="searchQuery"
            placeholder="Search for codes..."
        />
        <div
            :key="currentPage + searchQuery"
            class="mt-4 grid grid-cols-5 gap-4 max-[1495px]:grid-cols-4 max-[1262px]:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1"
        >
            <CodeView
                v-for="(code, index) in filtered.slice(
                    currentPage * 20,
                    currentPage * 20 + 20,
                )"
                :key="code.id + index"
                :data="code"
            />
        </div>
        <Paginator
            v-model:currentPage="currentPage"
            class="mt-4"
            item-name="code"
            :data="filtered"
        />
    </div>
</template>

<script setup lang="ts">
import { useCodesStore } from '@/store';

const store = useCodesStore();

if (!store.codesLoaded) {
    await store.fetchCodes();
}

const searchQuery = ref('');
const currentPage = ref(0);
const filtered = ref(store.codes);
const hasItemsInCurrentPage = computed(
    () =>
        filtered.value.slice(
            currentPage.value * 20,
            currentPage.value * 20 + 20,
        ).length > 0,
);

watch(
    () => store.codes,
    (codes) => {
        filtered.value = codes.filter((code) =>
            code.title
                .toLocaleLowerCase('tr-TR')
                .includes(searchQuery.value.toLocaleLowerCase('tr-TR')),
        );

        while (!hasItemsInCurrentPage.value && currentPage.value > 0) {
            currentPage.value -= 1;
        }
    },
);

watch(searchQuery, (value) => {
    filtered.value = store.codes.filter((code) =>
        code.title
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
    title: 'Codes',
    meta: [
        {
            name: 'og:title',
            content: 'Codes | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
