<script setup lang="ts">
const { name: iconName } = defineProps<{ name: string }>();

const SVGComponent = shallowRef<Component>();

import(`../assets/icons/${iconName}.svg`).then((svg) => {
    SVGComponent.value = svg.default;
});
</script>

<template>
    <component :is="SVGComponent" />
</template>
