<template>
    <div class="bg-spacex-3">
        <NuxtLayout name="auth-check">
            <Navbar />
            <Sidebar />
            <section
                class="h-[calc(100vh-70px)] w-full overflow-x-hidden bg-spacex-4 p-5 lg:ml-64 lg:w-[calc(100%-256px)] lg:rounded-tl-2xl"
            >
                <slot />
            </section>
        </NuxtLayout>
    </div>
</template>
