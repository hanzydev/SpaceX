<template>
    <div v-bind="$attrs" class="relative flex justify-between">
        <Icon
            name="search"
            class="absolute top-3 left-3 text-slate-300 h-6 w-6"
        />
        <input
            v-model="searchQuery"
            class="h-12 pl-11 pr-4 py-2.5 bg-spacex-3 rounded-lg w-full outline-none placeholder-slate-300 focus:ring-2 focus:ring-spacex-primary"
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
