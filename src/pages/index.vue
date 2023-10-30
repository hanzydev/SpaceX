<template>
    <div class="flex h-screen items-center justify-center">
        <Spinner :size="64" />
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store';

const router = useRouter();
const store = useUserStore();

if (!useCookie('token').value) {
    router.push('/auth/login');
} else {
    const json = await useAPI('/auth/@me', {
        auth: true,
    });

    if (json?.error) {
        router.push('/auth/login');
    } else {
        store.setUsername(json.username);
        store.set2FaEnabled(json.twoFaEnabled);
        router.push('/dashboard');
    }
}

useHead({
    title: 'SpaceX',
    meta: [
        {
            name: 'og:title',
            content: 'SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
