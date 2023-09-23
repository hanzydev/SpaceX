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
            class="sr-only peer"
            :disabled="disabled"
        />
        <div
            class="w-11 h-6 bg-spacex-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spacex-primary"
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
