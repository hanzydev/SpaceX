<template>
    <Modal :is-open="isModalOpen" @close="isModalOpen = false">
        <div class="flex flex-col justify-center p-4 w-full">
            <h2>{{ data.id }}</h2>
            <h3 class="!mt-5">Statistics</h3>
            <div
                class="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-5 !mt-3"
            >
                <div
                    class="bg-spacex-3 p-4 rounded-lg flex items-center gap-2 hover:ring-2 hover:ring-spacex-primary transition-all duration-300"
                >
                    <Icon name="eye" class="text-2xl text-spacex-primary" />
                    <h6>{{ data.views.today }}</h6>
                </div>
                <div
                    class="bg-spacex-3 p-4 rounded-lg flex items-center gap-2 hover:ring-2 hover:ring-spacex-primary transition-all duration-300"
                >
                    <Icon name="hdd" class="text-2xl text-spacex-primary" />
                    <h6>{{ data.size.formatted }}</h6>
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
            <div
                v-if="
                    ['image', 'video', 'audio'].includes(
                        data.type.split('/')[0],
                    )
                "
            >
                <h3 class="!mt-5">
                    {{
                        data.type.includes('image')
                            ? 'Image'
                            : data.type.includes('video')
                            ? 'Video'
                            : 'Audio'
                    }}
                </h3>
                <div class="w-full mt-3">
                    <div
                        v-if="data.type.includes('image')"
                        class="w-full bg-no-repeat bg-contain bg-center select-none h-80"
                        :style="{
                            backgroundImage: `url(${API_URL}/uploads/${
                                data.id
                            }?ref=cdn${data.private ? `&token=${token}` : ''})`,
                        }"
                    />

                    <video
                        v-else-if="data.type.includes('video')"
                        :src="`${API_URL}/uploads/${data.id}?ref=cdn${
                            data.private ? `&token=${token}` : ''
                        }`"
                        controls
                        class="max-h-80 w-full rounded-lg"
                    />

                    <audio
                        v-else-if="data.type.includes('audio')"
                        :src="`${API_URL}/uploads/${data.id}?ref=cdn${
                            data.private ? `&token=${token}` : ''
                        }`"
                        controls
                        class="w-full"
                    />
                </div>
            </div>

            <h3 class="!mt-5">Controls</h3>

            <div class="grid max-xs:grid-cols-1 grid-cols-2 gap-2 mt-3 w-full">
                <button
                    class="flex items-center py-2 px-3 w-full gap-2 rounded-lg bg-spacex-2 hover:bg-spacex-3 transition-colors duration-300 focus:ring-2 focus:ring-spacex-primary"
                    @click="handleCopy"
                >
                    <Icon name="copy" />
                    <span>Copy Link</span>
                </button>
                <button
                    class="flex items-center h-10 px-3 gap-2 rounded-lg bg-spacex-2 hover:bg-spacex-3 transition-colors duration-300 focus:ring-2 focus:ring-spacex-primary"
                    @click="handleDownload"
                >
                    <Icon name="download" />
                    <span>Download</span>
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

                <button
                    v-if="parentFolder"
                    :class="`flex items-center h-10 px-3 gap-2 rounded-lg bg-spacex-2 hover:bg-spacex-3 transition-colors duration-300 focus:ring-2 focus:ring-spacex-primary ${
                        isRemoving && 'opacity-50 cursor-not-allowed'
                    }`"
                    :disabled="isRemoving"
                    @click="handleRemove"
                >
                    <Icon v-if="!isRemoving" name="folder-minus" />
                    <span v-if="!isRemoving">Remove from Folder</span>
                    <Spinner v-else :size="24" color="#fff" />
                </button>
            </div>
        </div>
    </Modal>
    <div
        :class="`cursor-pointer h-[176px] flex flex-col items-center justify-center p-4 bg-spacex-3 rounded-lg relative transition-all duration-300 ${
            isModalOpen || alwaysRing
                ? 'ring-2 ring-spacex-primary'
                : 'hover:ring-2 hover:ring-spacex-primary'
        }`"
        @click="
            $props.onClick
                ? $props.onClick($event)
                : (data.type.includes('image') ||
                      data.type.includes('video')) &&
                  !isLoaded
                ? null
                : (isModalOpen = true)
        "
    >
        <img
            v-show="data.type.includes('image') && isLoaded"
            ref="loadableElementRef"
            :src="`${API_URL}/uploads/${data.id}?ref=cdn${
                data.private ? `&token=${token}` : ''
            }`"
            :alt="data.id"
            class="rounded-lg w-full h-full absolute object-contain"
            @load="isLoaded = true"
        />
        <div
            v-if="data.type.includes('image') && !isLoaded"
            class="w-full h-full flex items-center justify-center"
        >
            <Icon
                name="picture"
                class="text-spacex-1 !h-16 !w-16 shimmer animate-pulse"
            />
        </div>

        <div
            v-else-if="data.type.includes('video')"
            class="flex items-center justify-center w-full h-full"
        >
            <video
                v-show="isLoaded"
                ref="loadableElementRef"
                :src="`${API_URL}/uploads/${data.id}?ref=cdn${
                    data.private ? `&token=${token}` : ''
                }`"
                class="rounded-lg w-full h-full absolute object-contain"
                loop
                muted
                @canplay="isLoaded = true"
            />
            <div
                v-if="!isLoaded"
                class="w-full h-full flex items-center justify-center"
            >
                <Icon
                    name="video"
                    class="text-spacex-1 !h-16 !w-16 shimmer animate-pulse"
                />
            </div>
        </div>
        <div
            v-else-if="!data.type.includes('image')"
            class="flex flex-col items-center justify-center w-full h-full"
        >
            <Icon
                v-if="data.type.includes('audio')"
                name="file-audio"
                class="text-4xl"
            />

            <Icon
                v-else-if="
                    data.type.includes('text') ||
                    [
                        'json',
                        'xml',
                        'csv',
                        'html',
                        'css',
                        'js',
                        'md',
                        'txt',
                    ].includes(data.id.split('.').pop() ?? '')
                "
                name="file-text"
                class="text-4xl"
            />
            <Icon
                v-else-if="
                    ['zip', 'rar', '7z', 'tar', 'gz', 'bin'].includes(
                        data.id.split('.').pop() ?? '',
                    )
                "
                name="file-archive"
                class="text-4xl"
            />
            <Icon v-else name="file-unknown" class="text-4xl" />
            <h6 class="!mt-1.5 text-slate-400">{{ data.id }}</h6>
        </div>
    </div>
</template>

<script setup lang="ts">
import { fire } from '@/util/toast';
import { useUploadsStore, useFoldersStore } from '@/store';
import { Upload } from '@/types';

const { data, alwaysRing, parentFolder } = defineProps<{
    data: Upload;
    alwaysRing?: boolean;
    parentFolder?: string;
    onClick?: (event: MouseEvent) => void;
}>();

const router = useRouter();
const uploadsStore = useUploadsStore();
const folderStore = useFoldersStore();

const isLoaded = ref(false);
const isDeleting = ref(false);
const isRemoving = ref(false);
const isModalOpen = ref(false);

const loadableElementRef = ref<HTMLVideoElement | HTMLImageElement>();

const token = useCookie('token').value!;

const API_URL = import.meta.env.VITE_API_URL;
const SITE_URL = import.meta.env.VITE_SITE_URL;

onMounted(() => {
    if (data.type.includes('image')) {
        isLoaded.value =
            (loadableElementRef.value as HTMLImageElement)?.complete ?? false;
    }

    if (data.type.includes('video')) {
        isLoaded.value =
            (loadableElementRef.value as HTMLVideoElement)?.readyState === 4;
    }
});

const handleCopy = async () => {
    await navigator.clipboard.writeText(`${SITE_URL}/u/${data.id}`);

    fire('Link successfully copied to the clipboard!', {
        type: 'success',
    });
};

const handleDelete = async () => {
    isDeleting.value = true;

    const json = await uploadsStore.deleteUpload(data.id);

    isDeleting.value = false;

    if (json?.error) {
        fire(json.error, {
            type: 'error',
        });
    } else {
        isModalOpen.value = false;

        fire('Upload has been deleted successfully!', {
            type: 'success',
        });
    }
};

const handleRemove = async () => {
    isRemoving.value = true;

    const json = await folderStore.removeUpload(parentFolder!, data.id);

    isRemoving.value = false;

    if (json?.error) {
        fire(json.error, {
            type: 'error',
        });
    } else {
        isModalOpen.value = false;

        fire('Upload has been removed from folder successfully!', {
            type: 'success',
        });
    }
};

const handleOpen = () => {
    window.open(`/u/${data.id}`, '_blank');
};

const handleDownload = () => {
    window.open(
        `${API_URL}/uploads/${data.id}?ref=direct${
            data.private ? `&token=${token}` : ''
        }`,
        '_blank',
    );
};

const handleEdit = () => {
    router.push(`/dashboard/uploads/${data.id}/edit`);
};
</script>
