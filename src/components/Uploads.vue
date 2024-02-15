<template>
    <div v-bind="$attrs">
        <SearchBar v-model="searchQuery" placeholder="Search for uploads..." />
        <div
            :key="currentPage + searchQuery"
            class="mt-4 grid grid-cols-5 gap-4 max-[1495px]:grid-cols-4 max-[1262px]:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1"
        >
            <UploadView
                v-for="upload in filtered.slice(
                    currentPage * 20,
                    currentPage * 20 + 20,
                )"
                :key="upload.id"
                :data="upload"
                :parent-folder="parentFolder"
            />
        </div>
        <Paginator
            v-model="currentPage"
            class="mt-4"
            item-name="upload"
            :data="filtered"
        />
    </div>
</template>

<script setup lang="ts">
import { useUploadsStore } from '@/store';
import type { Upload } from '@/types';

const { filter = () => true, parentFolder } = defineProps<{
    filter?: (upload: Upload) => boolean;
    parentFolder?: string;
}>();

const store = useUploadsStore();

const searchQuery = ref('');
const currentPage = ref(0);
const filtered = ref(store.uploads.filter(filter));
const hasItemsInCurrentPage = computed(
    () =>
        filtered.value.slice(
            currentPage.value * 20,
            currentPage.value * 20 + 20,
        ).length > 0,
);

watch(
    () => store.uploads,
    (uploads) => {
        filtered.value = uploads
            .filter(filter)
            .filter((upload) =>
                upload.id
                    .toLocaleLowerCase('tr-TR')
                    .includes(searchQuery.value.toLocaleLowerCase('tr-TR')),
            );

        while (!hasItemsInCurrentPage.value && currentPage.value > 0) {
            currentPage.value -= 1;
        }
    },
);

watch(searchQuery, (value) => {
    filtered.value = store.uploads
        .filter(filter)
        .filter((upload) =>
            upload.id
                .toLocaleLowerCase('tr-TR')
                .includes(value.toLocaleLowerCase('tr-TR')),
        );

    while (!hasItemsInCurrentPage.value && currentPage.value > 0) {
        currentPage.value -= 1;
    }
});
</script>
