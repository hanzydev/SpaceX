<template>
    <GoBack to="/dashboard/shortened-urls" />
    <div
        class="absolute flex min-h-screen w-full flex-col items-center justify-center bg-spacex-5 p-4"
    >
        <form
            class="flex w-[30rem] flex-col rounded-xl bg-spacex-4 p-10 max-sm:w-80"
            @submit.prevent="handleShorten"
        >
            <h1 class="mx-auto max-sm:!text-3xl">Shorten URL</h1>

            <div class="mt-7 flex flex-col">
                <label class="text-sm font-semibold uppercase text-slate-300"
                    >URL</label
                >
                <input
                    v-model="shortenedURL.url"
                    type="text"
                    placeholder="Enter URL"
                    :class="`mt-1 h-10 rounded-lg bg-spacex-2 px-3 py-2 placeholder-slate-300 outline-none focus:ring-2 focus:ring-spacex-primary ${
                        isShorting && 'cursor-not-allowed'
                    }`"
                    :disabled="isShorting"
                />
            </div>

            <div class="mt-3 flex flex-col">
                <label class="text-sm font-semibold uppercase text-slate-300"
                    >DELETE AFTER VIEWS (0 = NEVER DELETE)</label
                >
                <div class="relative mt-1">
                    <input
                        v-model="shortenedURL.deleteAfterViews"
                        class="h-10 w-full rounded-md bg-spacex-2 px-3 py-2 placeholder-slate-300 outline-none focus:ring-2 focus:ring-spacex-primary"
                        type="number"
                        :min="0"
                        :max="100000"
                    />
                    <div
                        class="absolute right-0 top-0 flex h-full flex-col items-center justify-center rounded-r-md bg-spacex-1"
                    >
                        <button
                            class="flex w-6 items-center justify-center rounded-tr-md p-1 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
                            type="button"
                            @click="
                                shortenedURL.deleteAfterViews = (
                                    +shortenedURL.deleteAfterViews + 1
                                ).toString()
                            "
                        >
                            <Icon name="chevron-up" class="text-xs" />
                        </button>
                        <button
                            class="flex w-6 items-center justify-center rounded-br-md p-1 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
                            type="button"
                            @click="
                                shortenedURL.deleteAfterViews = (
                                    +shortenedURL.deleteAfterViews - 1
                                ).toString()
                            "
                        >
                            <Icon name="chevron-down" class="text-xs" />
                        </button>
                    </div>
                </div>
            </div>

            <div class="mt-3 flex w-fit items-center gap-2">
                <Switch v-model:is-checked="shortenedURL.private" />
                <h6>Make url private</h6>
            </div>

            <button
                :class="`mt-8 flex items-center justify-center rounded-lg bg-spacex-primary px-4 py-2 text-center outline-none ring-white focus:ring-2 ${
                    isShorting && 'cursor-not-allowed opacity-50'
                }`"
                :disabled="isShorting"
            >
                <span v-if="!isShorting">Shorten URL</span>
                <Spinner v-else :size="24" color="#fff" />
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { fire } from '@/util/toast';

const router = useRouter();

const shortenedURL = reactive({
    url: '',
    private: false,
    deleteAfterViews: '0',
});

const isShorting = ref(false);

const handleShorten = async () => {
    isShorting.value = true;

    const json = await useAPI('/shortened-urls', {
        method: 'POST',
        body: {
            ...shortenedURL,
            deleteAfterViews: +shortenedURL.deleteAfterViews,
        },
        auth: true,
    });

    if (json?.error) {
        isShorting.value = false;

        fire(json.error, {
            type: 'error',
        });
    } else {
        await router.push('/dashboard/shortened-urls');

        fire('URL has been shortened successfully!', {
            type: 'success',
        });
    }
};

watch(
    () => shortenedURL.deleteAfterViews,
    (value) => {
        if (+value > 100000) {
            shortenedURL.deleteAfterViews = '100000';
        } else if (value === '' || +value < 0) {
            shortenedURL.deleteAfterViews = '0';
        }
    },
);

definePageMeta({
    layout: 'auth-check',
});

useHead({
    title: 'Shorten URL',
    meta: [
        {
            name: 'og:title',
            content: 'Shorten URL | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
