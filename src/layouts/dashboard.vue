<template>
    <NuxtLayout name="auth-check">
        <Navbar />
        <Sidebar />
        <div class="max-lg:pt-10 lg:mt-1 lg:pl-64">
            <div class="h-full bg-spacex-4 p-5">
                <slot />
            </div>
        </div>
    </NuxtLayout>
</template>
