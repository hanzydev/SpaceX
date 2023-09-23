<template>
    <GoBack to="/dashboard/shortened-urls" />
    <div
        class="flex flex-col items-center absolute justify-center min-h-screen w-full p-4 bg-spacex-5"
    >
        <form
            class="flex flex-col bg-spacex-4 p-10 max-sm:w-80 w-[30rem] rounded-xl"
            @submit.prevent="handleShorten"
        >
            <h1 class="mx-auto max-sm:!text-3xl">Shorten URL</h1>

            <div class="mt-7 flex flex-col">
                <label class="font-semibold uppercase text-slate-300 text-sm"
                    >URL</label
                >
                <input
                    v-model="url"
                    type="text"
                    placeholder="Enter URL"
                    :class="`h-10 mt-1 py-2 px-3 bg-spacex-2 rounded-lg outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300 ${
                        isShorting && 'cursor-not-allowed'
                    }`"
                    :disabled="isShorting"
                />
            </div>

            <div class="mt-3 flex flex-col">
                <label class="font-semibold uppercase text-slate-300 text-sm"
                    >DELETE AFTER VIEWS (0 = NEVER DELETE)</label
                >
                <div class="relative mt-1">
                    <input
                        v-model="deleteAfterViews"
                        class="w-full h-10 py-2 px-3 bg-spacex-2 rounded-md outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300"
                        type="number"
                        :min="0"
                        :max="100000"
                    />
                    <div
                        class="absolute right-0 top-0 h-full flex items-center flex-col justify-center bg-spacex-1 rounded-r-md"
                    >
                        <button
                            class="p-1 w-6 flex items-center justify-center rounded-tr-md hover:ring-2 hover:ring-spacex-primary duration-300 transition-all"
                            type="button"
                            @click="
                                deleteAfterViews = (
                                    +deleteAfterViews + 1
                                ).toString()
                            "
                        >
                            <Icon name="chevron-up" class="text-xs" />
                        </button>
                        <button
                            class="p-1 w-6 flex items-center justify-center rounded-br-md hover:ring-2 hover:ring-spacex-primary duration-300 transition-all"
                            type="button"
                            @click="
                                deleteAfterViews = (
                                    +deleteAfterViews - 1
                                ).toString()
                            "
                        >
                            <Icon name="chevron-down" class="text-xs" />
                        </button>
                    </div>
                </div>
            </div>

            <div class="mt-3 w-fit flex items-center gap-2">
                <Switch v-model:is-checked="isPrivate" />
                <h6>Make url private</h6>
            </div>

            <button
                :class="`mt-8 py-2 px-4 bg-spacex-primary rounded-lg outline-none focus:ring-2 ring-white flex items-center justify-center text-center ${
                    isShorting && 'opacity-50 cursor-not-allowed'
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

const isShorting = ref(false);
const isPrivate = ref(false);
const deleteAfterViews = ref('0');
const url = ref('');

const handleShorten = async () => {
    isShorting.value = true;

    const json = await useAPI('/shortened-urls', {
        method: 'POST',
        body: {
            url: url.value,
            private: isPrivate.value,
            deleteAfterViews: +deleteAfterViews.value,
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

watch(deleteAfterViews, (value) => {
    if (+value > 100000) {
        deleteAfterViews.value = '100000';
    } else if (value === '' || +value < 0) {
        deleteAfterViews.value = '0';
    }
});

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
