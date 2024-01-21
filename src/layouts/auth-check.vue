<template>
    <slot v-if="isLoaded" />
</template>

<script setup lang="ts">
import { useUserStore } from '@/store';
import { fire } from '@/util/toast';

const store = useUserStore();
const isLoaded = ref(false);

if (!useCookie('token').value) {
    throw createError({ statusCode: 401 });
} else {
    const json = await useAPI('/auth/@me', {
        auth: true,
    });

    if (json?.error) {
        useCookie('token', { maxAge: -1 }).value = '';
        throw createError({ statusCode: 401 });
    } else {
        store.setUsername(json.username);
        store.set2FaEnabled(json.twoFaEnabled);
        isLoaded.value = true;
    }
}

onMounted(() => {
    const isToastFired = sessionStorage.getItem('isToastFired');

    if (isLoaded.value && !isToastFired) {
        fire(`Welcome back, ${store.username}!`, { type: 'success' });
        sessionStorage.setItem('isToastFired', 'true');
    }
});
</script>
