<template>
    <div v-bind="$attrs" class="relative flex justify-between">
        <Icon
            name="search"
            class="absolute left-3 top-3 h-6 w-6 text-slate-300"
        />
        <input
            v-model="searchQuery"
            class="h-12 w-full rounded-lg bg-spacex-3 py-2.5 pl-11 pr-4 placeholder-slate-300 outline-none focus:ring-2 focus:ring-spacex-primary"
            type="text"
            :placeholder="placeholder"
        />
    </div>
</template>

<script setup lang="ts">
const { value: rawSearchQuery } = defineProps<{
    placeholder: string;
    value: string;
}>();

const searchQuery = ref(rawSearchQuery);

const emit = defineEmits<{
    (event: 'update:value', value: string): void;
}>();

watch(searchQuery, (value) => {
    emit('update:value', value);
});
</script>
