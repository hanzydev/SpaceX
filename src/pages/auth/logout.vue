<template>
    <div class="flex h-screen items-center justify-center">
        <Spinner :size="64" />
    </div>
</template>

<script setup lang="ts">
const router = useRouter();

useCookie('token', { maxAge: -1 }).value = '';
router.push('/auth/login');
</script>
