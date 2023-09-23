<template>
    <div
        v-bind="$attrs"
        class="p-2 bg-spacex-3 rounded-lg w-full flex text-center items-center justify-center"
    >
        <div class="flex mr-auto gap-2">
            <button
                :class="`text-slate-400 bg-spacex-2 p-2 rounded-md transition-colors duration-300 focus:ring-2 focus:ring-spacex-primary ${
                    isFirstPage ? 'cursor-not-allowed' : 'hover:text-white'
                }`"
                aria-label="First page"
                :disabled="isFirstPage"
                @click="$emit('update:currentPage', 0)"
            >
                <Icon name="chevron-left-2x" />
            </button>
            <button
                :class="`text-slate-400 bg-spacex-2 p-2 rounded-md transition-colors duration-300 focus:ring-2 focus:ring-spacex-primary ${
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
        <div class="flex ml-auto gap-2">
            <button
                :class="`text-slate-400 bg-spacex-2 p-2 rounded-md transition-colors duration-300 focus:ring-2 focus:ring-spacex-primary ${
                    isLastPage ? 'cursor-not-allowed' : 'hover:text-white'
                }`"
                aria-label="Next page"
                :disabled="isLastPage"
                @click="$emit('update:currentPage', currentPage + 1)"
            >
                <Icon name="chevron-right" />
            </button>
            <button
                :class="`text-slate-400 bg-spacex-2 p-2 rounded-md transition-colors duration-300 focus:ring-2 focus:ring-spacex-primary ${
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
