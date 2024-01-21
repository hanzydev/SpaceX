<template>
    <GoBack to="/dashboard/shortened-urls" />
    <div
        class="flex min-h-screen w-screen flex-col items-center justify-center p-4"
    >
        <form
            class="flex w-[30rem] flex-col rounded-xl bg-spacex-4 p-10 max-sm:w-80"
            @submit.prevent="handleEdit"
        >
            <h1 class="mx-auto max-sm:!text-3xl">Edit Shortened URL</h1>

            <div class="mt-7 flex flex-col">
                <label class="text-sm font-semibold uppercase text-slate-300"
                    >Id</label
                >
                <input
                    v-model="shortenedURL.id"
                    type="text"
                    placeholder="Enter Id"
                    :class="`mt-1 h-10 rounded-lg bg-spacex-2 px-3 py-2 placeholder-slate-300 outline-none focus:ring-2 focus:ring-spacex-primary ${
                        isEditing && 'cursor-not-allowed'
                    }`"
                    :disabled="isEditing"
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
                <Switch v-model="shortenedURL.private" />
                <h6>Make url private</h6>
            </div>

            <button
                :class="`mt-8 flex items-center justify-center rounded-lg bg-spacex-primary px-4 py-2 text-center outline-none ring-white focus:ring-2 ${
                    isEditing && 'cursor-not-allowed opacity-50'
                }`"
                :disabled="isEditing"
            >
                <span v-if="!isEditing">Edit URL</span>
                <Spinner v-else :size="24" color="#fff" />
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { fire } from '@/util/toast';
import shortenedURLEmitter from '@/util/emitters/shortened-url';

const router = useRouter();
const route = useRoute();

const shortenedURL = reactive({
    id: '',
    private: false,
    deleteAfterViews: '0',
});

const isEditing = ref(false);

const json = await useAPI(`/shortened-urls/${route.params.id}`, {
    auth: true,
});

if (json?.error) {
    throw createError({ statusCode: 404 });
} else {
    shortenedURL.id = json.id;
    shortenedURL.private = json.private;
    shortenedURL.deleteAfterViews = json.deleteAfterViews.toString();

    shortenedURLEmitter.on(
        'UPDATE_SHORTENED_URL',
        ({
            id: oldId,
            newId,
            private: newIsPrivate,
            deleteAfterViews: newDeleteAfterViews,
        }) => {
            if (oldId === json.id && !isEditing.value) {
                shortenedURL.id = newId;
                shortenedURL.private = newIsPrivate;
                shortenedURL.deleteAfterViews = newDeleteAfterViews.toString();

                router.replace(`/dashboard/shortened-urls/${newId}/edit`);
            }
        },
    );

    shortenedURLEmitter.on('DELETE_SHORTENED_URL', (shortenedURLId) => {
        if (shortenedURLId === json.id) {
            router.push('/dashboard/shortened-urls');
        }
    });
}

const handleEdit = async () => {
    isEditing.value = true;

    const json = await useAPI(`/shortened-urls/${route.params.id}`, {
        method: 'PATCH',
        body: {
            ...shortenedURL,
            deleteAfterViews: +shortenedURL.deleteAfterViews,
        },
        auth: true,
    });

    isEditing.value = false;

    if (json?.error) {
        fire(json.error, {
            type: 'error',
        });
    } else {
        await router.push('/dashboard/shortened-urls');

        fire('Shortened URL has been edited successfully!', {
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
    title: 'Edit Shortened URL',
    meta: [
        {
            name: 'og:title',
            content: 'Edit Shortened URL | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
