<template>
    <button
        class="fixed ring-2 ring-spacex-primary hover:bg-spacex-primary focus:ring-white z-50 bg-spacex-4 top-4 left-4 p-3 h-12 w-12 rounded-md flex items-center justify-center transition-all duration-300 focus:ring-2 focus:ring-spacex-primary"
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
