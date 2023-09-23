<template>
    <NuxtLayout name="auth-check">
        <Navbar />
        <Sidebar />
        <div class="lg:pl-64 lg:mt-1 max-lg:pt-10">
            <div class="p-5 h-full bg-spacex-4">
                <slot />
            </div>
        </div>
    </NuxtLayout>
</template>
