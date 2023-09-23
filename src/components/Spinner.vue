<template>
    <svg
        class="progress-ring outline-none"
        viewBox="0 0 16 16"
        tabindex="-1"
        aria-valuemin="0"
        aria-valuemax="100"
        :width="size"
        :height="size"
        role="progressbar"
    >
        <circle
            class="fill-none"
            :style="{
                stroke: color,
                animationDuration: duration,
            }"
            cx="50%"
            cy="50%"
            r="7"
            stroke-dasharray="3"
        />
    </svg>
</template>

<script setup lang="ts">
const {
    size,
    color = 'var(--color-spacex-primary)',
    duration = '2s',
} = defineProps<{
    size: number;
    color?: string;
    duration?: string;
}>();
</script>

<style scoped>
.progress-ring {
    min-inline-size: 16px;
    min-block-size: 16px;
}

.progress-ring circle {
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
    transition: all 1 linear;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-dasharray: 43.97;
    animation: progress-ring linear infinite;
}

@keyframes progress-ring {
    0% {
        stroke-dasharray: 0.01px 43.97px;
        transform: rotate(0);
    }
    50% {
        stroke-dasharray: 21.99px 21.99px;
        transform: rotate(450deg);
    }
    100% {
        stroke-dasharray: 0.01px 43.97px;
        transform: rotate(1080deg);
    }
}
</style>
