<template>
    <label
        :class="`relative inline-flex items-center ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`"
    >
        <input
            v-model="isChecked"
            type="checkbox"
            value=""
            class="peer sr-only"
            :disabled="disabled"
        />
        <div
            class="peer h-6 w-11 rounded-full bg-spacex-2 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:bg-spacex-primary peer-checked:after:translate-x-full peer-checked:after:border-white"
        ></div>
    </label>
</template>

<script setup lang="ts">
const { isChecked: isCheckedRaw = false, disabled = false } = defineProps<{
    isChecked?: boolean;
    disabled?: boolean;
}>();

const isChecked = ref(isCheckedRaw);

const emit = defineEmits<{
    (event: 'update:isChecked', isChecked: boolean): void;
}>();

watch(isChecked, (value) => {
    emit('update:isChecked', value);
});

watch(
    () => isCheckedRaw,
    (value) => {
        isChecked.value = value;
    },
);
</script>
