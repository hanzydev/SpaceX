<template>
    <div
        v-bind="$attrs"
        class="flex w-full items-center justify-center rounded-lg bg-spacex-3 p-2 text-center"
    >
        <div class="mr-auto flex gap-2">
            <button
                :class="`rounded-md bg-spacex-2 p-2 text-slate-400 transition-colors duration-300 focus:ring-2 focus:ring-spacex-primary ${
                    isFirstPage ? 'cursor-not-allowed' : 'hover:text-white'
                }`"
                aria-label="First page"
                :disabled="isFirstPage"
                @click="$emit('update:currentPage', 0)"
            >
                <Icon name="chevron-left-2x" />
            </button>
            <button
                :class="`rounded-md bg-spacex-2 p-2 text-slate-400 transition-colors duration-300 focus:ring-2 focus:ring-spacex-primary ${
                    isFirstPage ? 'cursor-not-allowed' : 'hover:text-white'
                }`"
                aria-label="Previous page"
                :disabled="isFirstPage"
                @click="$emit('update:currentPage', currentPage - 1)"
            >
                <Icon name="chevron-left" />
            </button>
        </div>
        <p class="text-slate-400 max-sm:text-sm">
            Page
            {{
                Math.ceil(data.length / itemsPerPage) === 0
                    ? 0
                    : currentPage + 1
            }}
            of {{ Math.ceil(data.length / itemsPerPage) }} ({{ data.length }}
            {{ itemName }}s)
        </p>
        <div class="ml-auto flex gap-2">
            <button
                :class="`rounded-md bg-spacex-2 p-2 text-slate-400 transition-colors duration-300 focus:ring-2 focus:ring-spacex-primary ${
                    isLastPage ? 'cursor-not-allowed' : 'hover:text-white'
                }`"
                aria-label="Next page"
                :disabled="isLastPage"
                @click="$emit('update:currentPage', currentPage + 1)"
            >
                <Icon name="chevron-right" />
            </button>
            <button
                :class="`rounded-md bg-spacex-2 p-2 text-slate-400 transition-colors duration-300 focus:ring-2 focus:ring-spacex-primary ${
                    isLastPage ? 'cursor-not-allowed' : 'hover:text-white'
                }`"
                aria-label="Last page"
                :disabled="isLastPage"
                @click="
                    $emit(
                        'update:currentPage',
                        Math.ceil(data.length / itemsPerPage) - 1,
                    )
                "
            >
                <Icon name="chevron-right-2x" />
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
const {
    currentPage,
    data,
    itemName = 'item',
    itemsPerPage = 20,
} = defineProps<{
    currentPage: number;
    data: any[];
    itemName?: string;
    itemsPerPage?: number;
}>();

const router = useRouter();
const route = useRoute();

const emit = defineEmits<{
    (event: 'update:currentPage', value: number): void;
}>();

const isFirstPage = computed(() => currentPage === 0);
const isLastPage = computed(
    () => currentPage >= Math.ceil(data.length / itemsPerPage) - 1,
);

watch(
    () => currentPage,
    (value) => {
        router.replace({ query: { ...route.query, page: value + 1 } });
    },
);

if (!route.query.page) {
    router.replace({ query: { ...route.query, page: 1 } });
} else {
    emit('update:currentPage', Number(route.query.page) - 1);
}
</script>
