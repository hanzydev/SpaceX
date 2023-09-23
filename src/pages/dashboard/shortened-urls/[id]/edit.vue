<template>
    <GoBack to="/dashboard/shortened-urls" />
    <div
        class="flex flex-col items-center absolute justify-center min-h-screen w-full p-4 bg-spacex-5"
    >
        <form
            class="flex flex-col bg-spacex-4 p-10 max-sm:w-80 w-[30rem] rounded-xl"
            @submit.prevent="handleEdit"
        >
            <h1 class="mx-auto max-sm:!text-3xl">Edit Shortened URL</h1>

            <div class="mt-7 flex flex-col">
                <label class="font-semibold uppercase text-slate-300 text-sm"
                    >Id</label
                >
                <input
                    v-model="id"
                    type="text"
                    placeholder="Enter Id"
                    :class="`h-10 mt-1 py-2 px-3 bg-spacex-2 rounded-lg outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300 ${
                        isEditing && 'cursor-not-allowed'
                    }`"
                    :disabled="isEditing"
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
                    isEditing && 'opacity-50 cursor-not-allowed'
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

const isEditing = ref(false);

const id = ref('');
const isPrivate = ref(false);
const deleteAfterViews = ref('0');

const json = await useAPI(`/shortened-urls/${route.params.id}`, {
    auth: true,
});

if (json?.error) {
    throwError(404);
} else {
    id.value = json.id;
    isPrivate.value = json.private;
    deleteAfterViews.value = json.deleteAfterViews.toString();

    shortenedURLEmitter.on(
        'UPDATE_SHORTENED_URL',
        ({
            id: oldId,
            newId,
            private: newIsPrivate,
            deleteAfterViews: newDeleteAfterViews,
        }) => {
            if (oldId === json.id && !isEditing.value) {
                id.value = newId;
                isPrivate.value = newIsPrivate;
                deleteAfterViews.value = newDeleteAfterViews.toString();
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
            id: id.value,
            private: isPrivate.value,
            deleteAfterViews: +deleteAfterViews.value,
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
    title: 'Edit URL',
    meta: [
        {
            name: 'og:title',
            content: 'Edit URL | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
