<template>
    <GoBack to="/dashboard/codes" />
    <div
        class="flex flex-col items-center absolute justify-center min-h-screen w-full p-4 bg-spacex-5"
    >
        <form
            class="flex flex-col bg-spacex-4 p-10 max-sm:w-80 max-lg:w-[30rem] w-[50rem] rounded-xl"
            @submit.prevent="handleShare"
        >
            <h1 class="mx-auto max-sm:!text-3xl">Share Code</h1>

            <div class="mt-7 flex flex-col">
                <label class="font-semibold uppercase text-slate-300 text-sm"
                    >Title</label
                >
                <input
                    v-model="code.title"
                    type="text"
                    placeholder="Enter Title"
                    :class="`h-10 mt-1 py-2 px-3 bg-spacex-2 rounded-lg outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300 ${
                        isSharing && 'cursor-not-allowed'
                    }`"
                    :disabled="isSharing"
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

            <div class="mt-3 flex flex-col">
                <label class="font-semibold uppercase text-slate-300 text-sm"
                    >Content</label
                >
                <div
                    class="mt-1 relative w-full h-[45vh] flex items-center justify-center"
                >
                    <MonacoEditor
                        v-model:value="code.content"
                        :language="code.language.toLowerCase()"
                        :options="{ theme: 'spacex' }"
                        @load="onEditorLoad"
                    >
                        <template #loading>
                            <div
                                class="flex items-center justify-center w-full h-full"
                            >
                                <Spinner :size="64" />
                            </div>
                        </template>
                    </MonacoEditor>
                </div>
            </div>

            <div class="mt-3 w-fit flex items-center gap-2">
                <Switch v-model:is-checked="isPrivate" />
                <h6>Make code private</h6>
            </div>

            <div class="grid sm:grid-cols-2 w-full gap-2 mt-8 relative">
                <Dropdown
                    id="language-dropdown"
                    default-item="JavaScript"
                    direction="top"
                    search-placeholder="Search for a language"
                    item-name="language"
                    :items="languages"
                    :is-open="isDropdownOpened"
                    @change="
                        code.language = $event;
                        isDropdownOpened = false;
                    "
                />
                <button
                    id="language-dropdown-toggler"
                    type="button"
                    :class="`py-2 px-4 bg-spacex-2 rounded-lg outline-none focus:ring-2 focus:ring-spacex-primary flex items-center justify-center text-center ${
                        isSharing && 'opacity-50 cursor-not-allowed'
                    }`"
                    :disabled="isSharing"
                    @click="isDropdownOpened = !isDropdownOpened"
                >
                    {{ code.language }}
                </button>
                <button
                    :class="`py-2 px-4 bg-spacex-primary rounded-lg outline-none focus:ring-2 ring-white flex items-center justify-center text-center ${
                        isSharing && 'opacity-50 cursor-not-allowed'
                    }`"
                    :disabled="isSharing"
                >
                    <span v-if="!isSharing">Share Code</span>
                    <Spinner v-else :size="24" color="#fff" />
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { fire } from '@/util/toast';
import * as Monaco from 'monaco-editor';
import monacoTheme from '@/assets/monaco.json';

const router = useRouter();

const isPrivate = ref(false);
const deleteAfterViews = ref('0');
const code = reactive({
    title: '',
    content: '',
    language: 'JavaScript',
});

const isSharing = ref(false);
const isDropdownOpened = ref(false);

const languages = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C++',
    'C#',
    'C',
    'Go',
    'PHP',
    'Rust',
    'Ruby',
    'HTML',
    'CSS',
    'JSON',
    'Markdown',
];

const onEditorLoad = (monaco: typeof Monaco) => {
    monaco.editor.defineTheme('spacex', monacoTheme as any);
    monaco.editor.setTheme('spacex');
};

const handleShare = async () => {
    isSharing.value = true;

    const json = await useAPI('/codes', {
        method: 'POST',
        body: {
            ...code,
            language: code.language.toLowerCase(),
            private: isPrivate.value,
            deleteAfterViews: +deleteAfterViews.value,
        },
        auth: true,
    });

    if (json?.error) {
        isSharing.value = false;

        fire(json.error, {
            type: 'error',
        });
    } else {
        await router.push('/dashboard/codes');

        fire('Code has been shared successfully!', {
            type: 'success',
        });
    }
};

const onClickOutside = (e: any) => {
    if (
        isDropdownOpened.value &&
        !e.target.closest('#language-dropdown') &&
        !e.target.closest('#language-dropdown-toggler')
    ) {
        isDropdownOpened.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', onClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', onClickOutside);
});

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
    title: 'Share Code',
    meta: [
        {
            name: 'og:title',
            content: 'Share Code | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
