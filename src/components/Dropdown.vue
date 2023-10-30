<template>
    <div
        ref="dropdownRef"
        class="absolute hidden w-72 rounded-xl shadow-lg ring-2 ring-spacex-primary"
        :class="{
            'h-16': !state.filteredItems.length,
            'h-36': state.filteredItems.length,
            '-top-52': direction === 'top' && state.filteredItems.length,
            '-top-32': direction === 'top' && !state.filteredItems.length,
            'top-16': direction === 'bottom',
        }"
    >
        <div
            class="relative flex justify-between rounded-t-lg ring-2 ring-spacex-primary"
        >
            <Icon
                name="search"
                class="absolute left-3 top-3 h-6 w-6 text-slate-300"
            />
            <input
                v-model="state.searchQuery"
                class="h-12 w-full rounded-t-lg bg-spacex-3 py-2.5 pl-11 pr-4 font-medium placeholder-slate-300 outline-none transition-colors duration-300 hover:bg-spacex-2 focus:bg-spacex-2"
                type="text"
                :placeholder="searchPlaceholder"
            />
        </div>

        <div
            class="flex h-full w-full flex-col items-center overflow-y-auto rounded-b-lg bg-spacex-3 ring-2 ring-spacex-primary"
            :class="{
                'justify-center': !state.filteredItems.length,
            }"
        >
            <button
                v-for="item in state.filteredItems"
                :key="item"
                class="w-full px-4 py-3 text-left font-normal text-slate-300 transition-colors duration-300 hover:bg-spacex-2"
                type="button"
                @click="selectItem(item)"
            >
                {{ item }}
            </button>

            <span v-if="!state.filteredItems.length" class="text-slate-300">
                No {{ itemName }}s was found
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import gsap from 'gsap';

const {
    items,
    direction = 'bottom',
    isOpen,
    searchPlaceholder = 'Search for an item',
    itemName = 'item',
} = defineProps<{
    items: string[];
    defaultItem: string;
    direction?: 'top' | 'bottom';
    isOpen?: boolean;
    searchPlaceholder?: string;
    itemName?: string;
}>();

const emit = defineEmits<{
    (event: 'change', item: string): void;
}>();

const dropdownRef = ref<HTMLDivElement>();

const state = reactive<{
    searchQuery: string;
    filteredItems: string[];
}>({
    searchQuery: '',
    filteredItems: items,
});

const selectItem = (item: string) => {
    emit('change', item);
};

const openDropdown = () => {
    gsap.fromTo(
        dropdownRef.value!,
        {
            opacity: 0,
            y: direction === 'top' ? 30 : -30,
        },
        {
            opacity: 1,
            y: 0,
            duration: 0.2,
            display: 'block',
        },
    );
};

const closeDropdown = () => {
    gsap.to(dropdownRef.value!, {
        opacity: 0,
        y: direction === 'top' ? 30 : -30,
        duration: 0.2,
        onComplete: () => {
            gsap.set(dropdownRef.value!, {
                display: 'none',
            });
        },
    });
};

watch(
    () => state.searchQuery,
    () => {
        state.filteredItems = items.filter((item) =>
            item
                .toLocaleLowerCase('tr-TR')
                .includes(state.searchQuery.toLocaleLowerCase('tr-TR')),
        );
    },
);

watch(
    () => isOpen,
    (value) => {
        if (value) {
            openDropdown();
        } else {
            closeDropdown();
        }
    },
);
</script>
