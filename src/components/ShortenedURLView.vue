<template>
    <Modal :is-open="isModalOpen" @close="isModalOpen = false">
        <div class="flex flex-col justify-center p-4 w-full">
            <h2>{{ data.id }}</h2>
            <h3 class="!mt-5">Statistics</h3>
            <div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-5 !mt-3">
                <div
                    class="bg-spacex-3 p-4 rounded-lg flex items-center gap-2 hover:ring-2 hover:ring-spacex-primary transition-all duration-300"
                >
                    <Icon name="eye" class="text-2xl text-spacex-primary" />
                    <h6>{{ data.views.today }}</h6>
                </div>
                <div
                    class="bg-spacex-3 p-4 rounded-lg flex items-center gap-2 hover:ring-2 hover:ring-spacex-primary transition-all duration-300"
                >
                    <Icon
                        name="calendar"
                        class="text-2xl text-spacex-primary"
                    />
                    <h6>{{ new Date(data.date).toLocaleDateString() }}</h6>
                </div>
            </div>

            <h3 class="!mt-5">URL</h3>
            <div
                class="bg-spacex-3 p-4 rounded-lg flex items-center gap-2 hover:ring-2 hover:ring-spacex-primary transition-all duration-300 !mt-3"
            >
                <Icon name="link" class="text-2xl text-spacex-primary" />
                <h6>{{ data.url }}</h6>
            </div>

            <h3 class="!mt-5">Controls</h3>
            <div
                class="grid max-xs:grid-cols-1 grid-cols-2 md:grid-cols-4 gap-2 mt-3 w-full"
            >
                <button
                    class="flex items-center py-2 px-3 w-full gap-2 rounded-lg bg-spacex-2 hover:bg-spacex-3 transition-colors duration-300 focus:ring-2 focus:ring-spacex-primary"
                    @click="handleCopy"
                >
                    <Icon name="copy" />
                    <span>Copy Link</span>
                </button>
                <button
                    class="flex items-center h-10 px-3 gap-2 rounded-lg bg-spacex-2 hover:bg-spacex-3 transition-colors duration-300 focus:ring-2 focus:ring-spacex-primary"
                    @click="handleOpen"
                >
                    <Icon name="link-open" />
                    <span>Open</span>
                </button>
                <button
                    class="flex items-center h-10 px-3 gap-2 rounded-lg bg-spacex-2 hover:bg-spacex-3 transition-colors duration-300 focus:ring-2 focus:ring-spacex-primary"
                    @click="handleEdit"
                >
                    <Icon name="pen" />
                    <span>Edit</span>
                </button>
                <button
                    :class="`flex items-center h-10 px-3 gap-2 rounded-lg bg-spacex-2 hover:bg-spacex-3 transition-colors duration-300 focus:ring-2 focus:ring-spacex-primary ${
                        isDeleting && 'opacity-50 cursor-not-allowed'
                    }`"
                    :disabled="isDeleting"
                    @click="handleDelete"
                >
                    <Icon v-if="!isDeleting" name="trash" />
                    <span v-if="!isDeleting">Delete</span>
                    <Spinner v-else :size="24" color="#fff" />
                </button>
            </div>
        </div>
    </Modal>
    <div
        :class="`cursor-pointer h-16 flex flex-col items-center justify-center p-4 bg-spacex-3 rounded-lg relative transition-all duration-300 ${
            isModalOpen
                ? 'ring-2 ring-spacex-primary'
                : 'hover:ring-2 hover:ring-spacex-primary'
        }`"
        @click="isModalOpen = true"
    >
        <h6 class="text-slate-400 text-center">
            {{ data.id.length > 24 ? `${data.id.slice(0, 24)}...` : data.id }}
        </h6>
    </div>
</template>

<script setup lang="ts">
import { fire } from '@/util/toast';
import { useShortenedURLsStore } from '@/store';
import { ShortenedURL } from '@/types';

const { data } = defineProps<{
    data: ShortenedURL;
}>();

const router = useRouter();
const store = useShortenedURLsStore();

const isDeleting = ref(false);
const isModalOpen = ref(false);

const SITE_URL = import.meta.env.VITE_SITE_URL;

const handleCopy = async () => {
    await navigator.clipboard.writeText(`${SITE_URL}/link/${data.id}`);

    fire('Link successfully copied to the clipboard!', {
        type: 'success',
    });
};

const handleDelete = async () => {
    isDeleting.value = true;

    const json = await store.deleteShortenedURL(data.id);

    isDeleting.value = false;

    if (json?.error) {
        fire(json.error, {
            type: 'error',
        });
    } else {
        isModalOpen.value = false;

        fire('Shortened URL has been deleted successfully!', {
            type: 'success',
        });
    }
};

const handleOpen = () => {
    window.open(`/link/${data.id}`, '_blank');
};

const handleEdit = () => {
    router.push(`/dashboard/shortened-urls/${data.id}/edit`);
};
</script>
