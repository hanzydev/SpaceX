<template>
    <h2>Logs</h2>
    <div class="mt-6">
        <SearchBar
            v-model="searchQuery"
            placeholder="Search for logs..."
        />
        <div class="relative w-full overflow-y-hidden">
            <table
                class="mt-4 w-full table-auto border-collapse rounded-lg bg-spacex-3"
            >
                <thead class="h-10 text-left">
                    <tr>
                        <th class="px-4 py-2 font-semibold">IP</th>
                        <th class="px-4 py-2 font-semibold">Action</th>
                        <th class="px-4 py-2 font-semibold">Message</th>
                        <th class="px-4 py-2 font-semibold">Date</th>
                    </tr>
                </thead>
                <tbody
                    :key="currentPage + searchQuery"
                    class="border-none text-slate-100"
                >
                    <tr
                        v-for="(log, index) in filtered.slice(
                            currentPage * 20,
                            currentPage * 20 + 20,
                        )"
                        :key="index"
                    >
                        <td class="border border-spacex-4 px-4 py-2">
                            <a
                                class="text-spacex-primary hover:underline"
                                target="_blank"
                                :href="`https://ipinfo.io/${log.ip}`"
                            >
                                {{ log.ip }}
                            </a>
                        </td>
                        <td class="border border-spacex-4 px-4 py-2">
                            {{ log.action }}
                        </td>
                        <td class="border border-spacex-4 px-4 py-2">
                            {{ log.message }}
                        </td>
                        <td class="border border-spacex-4 px-4 py-2">
                            {{ new Date(log.date).toLocaleString('en-US') }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <Paginator
            v-model="currentPage"
            class="mt-4"
            item-name="log"
            :data="filtered"
        />
    </div>
</template>

<script setup lang="ts">
import { useLogsStore } from '@/store';

const store = useLogsStore();

if (!store.logsLoaded) {
    await store.fetchLogs();
}

const searchQuery = ref('');
const currentPage = ref(0);
const filtered = ref(store.logs);
const hasItemsInCurrentPage = computed(
    () =>
        filtered.value.slice(
            currentPage.value * 20,
            currentPage.value * 20 + 20,
        ).length > 0,
);

watch(
    () => store.logs,
    (logs) => {
        filtered.value = logs.filter(
            (log) =>
                log.ip
                    .toLowerCase()
                    .includes(searchQuery.value.toLowerCase()) ||
                log.action
                    .toLowerCase()
                    .includes(searchQuery.value.toLowerCase()) ||
                log.message
                    .toLowerCase()
                    .includes(searchQuery.value.toLowerCase()),
        );

        while (!hasItemsInCurrentPage.value && currentPage.value > 0) {
            currentPage.value -= 1;
        }
    },
);

watch(searchQuery, (value) => {
    filtered.value = store.logs.filter(
        (log) =>
            log.ip.toLowerCase().includes(value.toLowerCase()) ||
            log.action.toLowerCase().includes(value.toLowerCase()) ||
            log.message.toLowerCase().includes(value.toLowerCase()),
    );

    while (!hasItemsInCurrentPage.value && currentPage.value > 0) {
        currentPage.value -= 1;
    }
});

definePageMeta({
    layout: 'dashboard',
});

useHead({
    title: 'Logs',
    meta: [
        {
            name: 'og:title',
            content: 'Logs | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
