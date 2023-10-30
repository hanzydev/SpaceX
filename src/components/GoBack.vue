<template>
    <button
        class="fixed left-4 top-4 z-50 flex h-12 w-12 items-center justify-center rounded-md bg-spacex-4 p-3 ring-2 ring-spacex-primary transition-all duration-300 hover:bg-spacex-primary focus:ring-2 focus:ring-spacex-primary focus:ring-white"
        aria-label="Go back"
        @click="$router.push($props.to)"
    >
        <Icon name="go-back" class="text-xl" />
    </button>
</template>

<script setup lang="ts">
defineProps<{
    to: string;
}>();
</script>
