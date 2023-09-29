<template>
    <div class="w-full overflow-y-hidden relative">
        <table class="w-full bg-spacex-3 rounded-lg border-collapse table-auto">
            <thead class="text-left h-10">
                <tr>
                    <th class="px-4 py-2 font-semibold">Name</th>
                    <th class="px-4 py-2 font-semibold">Size</th>
                    <th class="px-4 py-2 font-semibold">Type</th>
                    <th class="px-4 py-2 font-semibold">Date</th>
                    <th class="px-4 py-2 font-semibold">Actions</th>
                </tr>
            </thead>
            <tbody class="text-slate-100 border-none">
                <tr
                    v-for="(upload, index) in store.uploads.slice(
                        currentPage * 15,
                        currentPage * 15 + 15,
                    )"
                    :key="index"
                >
                    <td class="border px-4 py-2 border-spacex-4">
                        <span>{{ upload.id }}</span>
                    </td>
                    <td class="border px-4 py-2 border-spacex-4">
                        <span>{{ upload.size.formatted }}</span>
                    </td>
                    <td class="border px-4 py-2 border-spacex-4">
                        <span>{{ upload.type }}</span>
                    </td>
                    <td class="border px-4 py-2 border-spacex-4">
                        <span>{{
                            new Date(upload.date).toLocaleString('en-US')
                        }}</span>
                    </td>
                    <td class="border px-4 py-2 border-spacex-4">
                        <div class="flex items-center gap-3">
                            <button
                                class="text-slate-400 p-2 rounded-lg hover:bg-spacex-primary hover:text-white ring-1 ring-spacex-primary transition-colors duration-300"
                                aria-label="Open link"
                                @click="handleOpen(upload.id)"
                            >
                                <Icon name="link-open" />
                            </button>
                            <button
                                class="text-slate-400 p-2 rounded-lg hover:bg-spacex-primary hover:text-white ring-1 ring-spacex-primary transition-colors duration-300"
                                aria-label="Copy link"
                                @click="handleCopy(upload.id)"
                            >
                                <Icon name="copy" />
                            </button>
                            <button
                                class="text-slate-400 p-2 rounded-lg hover:bg-spacex-primary hover:text-white ring-1 ring-spacex-primary transition-colors duration-300"
                                aria-label="Download file"
                                @click="
                                    handleDownload(upload.id, upload.private)
                                "
                            >
                                <Icon name="download" />
                            </button>
                            <button
                                class="text-slate-400 p-2 rounded-lg hover:bg-spacex-primary hover:text-white ring-1 ring-spacex-primary transition-colors duration-300"
                                aria-label="Edit upload"
                                @click="handleEdit(upload.id)"
                            >
                                <Icon name="pen" />
                            </button>
                            <button
                                :class="`text-slate-400 p-2 rounded-lg hover:bg-spacex-primary hover:text-white ring-1 ring-spacex-primary transition-colors duration-300 ${
                                    deletings.includes(upload.id) &&
                                    'cursor-not-allowed'
                                }`"
                                aria-label="Delete upload"
                                :disabled="deletings.includes(upload.id)"
                                @click="handleDelete(upload.id)"
                            >
                                <Icon name="trash" />
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <Paginator
            v-model:currentPage="currentPage"
            item-name="upload"
            :data="store.uploads"
        />
    </div>
</template>

<script setup lang="ts">
import { useUploadsStore } from '@/store';
import { fire } from '@/util/toast';
import { API_URL, SITE_URL } from '@/constants';

const store = useUploadsStore();
const router = useRouter();

const deletings = ref<string[]>([]);
const currentPage = ref(0);

const handleCopy = (id: string) => {
    navigator.clipboard.writeText(`${SITE_URL}/u/${id}`);

    fire('Link successfully copied to the clipboard!', {
        type: 'success',
    });
};

const handleOpen = (id: string) => {
    window.open(`/u/${id}`, '_blank');
};

const handleDownload = (id: string, isPrivate: boolean) => {
    window.open(
        `${API_URL}/uploads/${id}?ref=direct${
            isPrivate ? `&token=${useCookie('token').value}` : ''
        }`,
        '_blank',
    );
};

const handleEdit = (id: string) => {
    router.push(`/dashboard/uploads/${id}/edit`);
};

const handleDelete = async (id: string) => {
    deletings.value.push(id);

    const json = await store.deleteUpload(id);

    deletings.value = deletings.value.filter((item) => item !== id);

    if (json?.error) {
        fire(json.error, {
            type: 'error',
        });
    } else {
        fire('Upload has been deleted successfully!', {
            type: 'success',
        });
    }
};
</script>
