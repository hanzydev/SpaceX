<template>
    <NuxtLayout name="auth-check">
        <Navbar />
        <Sidebar />
        <section
            class="h-[calc(100vh-70px)] w-full overflow-x-hidden bg-spacex-4 p-5 lg:ml-64 lg:w-[calc(100%-256px)]"
        >
            <slot />
        </section>
    </NuxtLayout>
</template>
