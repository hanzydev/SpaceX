<template>
    <div
        ref="dropdownRef"
        class="absolute w-72 rounded-xl hidden shadow-lg ring-2 ring-spacex-primary"
        :class="{
            'h-16': !state.filteredItems.length,
            'h-36': state.filteredItems.length,
            '-top-52': direction === 'top' && state.filteredItems.length,
            '-top-32': direction === 'top' && !state.filteredItems.length,
            'top-16': direction === 'bottom',
        }"
    >
        <div
            class="relative flex justify-between ring-2 ring-spacex-primary rounded-t-lg"
        >
            <Icon
                name="search"
                class="absolute top-3 left-3 text-slate-300 h-6 w-6"
            />
            <input
                v-model="state.searchQuery"
                class="h-12 pl-11 pr-4 font-medium py-2.5 bg-spacex-3 hover:bg-spacex-2 focus:bg-spacex-2 transition-colors duration-300 rounded-t-lg w-full outline-none placeholder-slate-300"
                type="text"
                :placeholder="searchPlaceholder"
            />
        </div>

        <div
            class="flex flex-col overflow-y-auto rounded-b-lg items-center h-full bg-spacex-3 w-full ring-2 ring-spacex-primary"
            :class="{
                'justify-center': !state.filteredItems.length,
            }"
        >
            <button
                v-for="item in state.filteredItems"
                :key="item"
                class="text-slate-300 px-4 py-3 font-normal text-left hover:bg-spacex-2 w-full transition-colors duration-300"
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
