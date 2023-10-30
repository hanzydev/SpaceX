<template>
    <h2>Shortened URLs</h2>
    <div class="mt-6">
        <SearchBar
            v-model:value="searchQuery"
            placeholder="Search for shortened urls..."
        />
        <div
            :key="searchQuery"
            class="mt-4 grid grid-cols-5 gap-4 max-[1495px]:grid-cols-4 max-[1262px]:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1"
        >
            <ShortenedURLView
                v-for="shortenedURL in filtered.slice(
                    currentPage * 20,
                    currentPage * 20 + 20,
                )"
                :key="shortenedURL.id"
                :data="shortenedURL"
            />
        </div>
        <Paginator
            v-model:currentPage="currentPage"
            class="mt-4"
            item-name="shortened url"
            :data="filtered"
            :items-per-page="3"
        />
    </div>
</template>

<script setup lang="ts">
import { useShortenedURLsStore } from '@/store';

const store = useShortenedURLsStore();

if (!store.shortenedURLsLoaded) {
    await store.fetchShortenedURLs();
}

const searchQuery = ref('');
const currentPage = ref(0);
const filtered = ref(store.shortenedURLs);
const hasItemsInCurrentPage = computed(
    () =>
        filtered.value.slice(
            currentPage.value * 20,
            currentPage.value * 20 + 20,
        ).length > 0,
);

watch(
    () => store.shortenedURLs,
    (shortenedURLs) => {
        filtered.value = shortenedURLs.filter((shortenedURL) =>
            shortenedURL.id
                .toLocaleLowerCase('tr-TR')
                .includes(searchQuery.value.toLocaleLowerCase('tr-TR')),
        );

        while (!hasItemsInCurrentPage.value && currentPage.value > 0) {
            currentPage.value -= 1;
        }
    },
);

watch(searchQuery, (value) => {
    filtered.value = store.shortenedURLs.filter((shortenedURL) =>
        shortenedURL.id
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
    title: 'Shortened URLs',
    meta: [
        {
            name: 'og:title',
            content: 'Shortened URLs | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
