<template>
    <GoBack to="/dashboard/codes" />
    <div
        class="flex min-h-screen w-screen flex-col items-center justify-center p-4"
    >
        <form
            class="flex w-[50rem] flex-col rounded-xl bg-spacex-4 p-10 max-lg:w-[30rem] max-sm:w-80"
            @submit.prevent="handleShare"
        >
            <h1 class="mx-auto max-sm:!text-3xl">Share Code</h1>

            <div class="mt-7 flex flex-col">
                <label class="text-sm font-semibold uppercase text-slate-300"
                    >Title</label
                >
                <input
                    v-model="code.title"
                    type="text"
                    placeholder="Enter Title"
                    :class="`mt-1 h-10 rounded-lg bg-spacex-2 px-3 py-2 placeholder-slate-300 outline-none focus:ring-2 focus:ring-spacex-primary ${
                        isSharing && 'cursor-not-allowed'
                    }`"
                    :disabled="isSharing"
                />
            </div>

            <div class="mt-3 flex flex-col">
                <label class="text-sm font-semibold uppercase text-slate-300"
                    >DELETE AFTER VIEWS (0 = NEVER DELETE)</label
                >
                <div class="relative mt-1">
                    <input
                        v-model="code.deleteAfterViews"
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
                                code.deleteAfterViews = (
                                    +code.deleteAfterViews + 1
                                ).toString()
                            "
                        >
                            <Icon name="chevron-up" class="text-xs" />
                        </button>
                        <button
                            class="flex w-6 items-center justify-center rounded-br-md p-1 transition-all duration-300 hover:ring-2 hover:ring-spacex-primary"
                            type="button"
                            @click="
                                code.deleteAfterViews = (
                                    +code.deleteAfterViews - 1
                                ).toString()
                            "
                        >
                            <Icon name="chevron-down" class="text-xs" />
                        </button>
                    </div>
                </div>
            </div>

            <div class="mt-3 flex flex-col">
                <label class="text-sm font-semibold uppercase text-slate-300"
                    >Content</label
                >
                <div
                    class="relative mt-1 flex h-[45vh] w-full items-center justify-center"
                >
                    <MonacoEditor
                        v-model="code.content"
                        :language="code.language.toLowerCase()"
                        :options="{ theme: 'spacex' }"
                        @load="handleEditorLoad"
                    >
                        <template #loading>
                            <div
                                class="flex h-full w-full items-center justify-center"
                            >
                                <Spinner :size="64" />
                            </div>
                        </template>
                    </MonacoEditor>
                </div>
            </div>

            <div class="mt-3 flex w-fit items-center gap-2">
                <Switch v-model="code.private" />
                <h6>Make code private</h6>
            </div>

            <div class="relative mt-8 grid w-full gap-2 sm:grid-cols-2">
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
                    :class="`z-10 flex items-center justify-center rounded-lg bg-spacex-2 px-4 py-2 text-center outline-none focus:ring-2 focus:ring-spacex-primary ${
                        isSharing && 'cursor-not-allowed opacity-50'
                    }`"
                    :disabled="isSharing"
                    @click="isDropdownOpened = !isDropdownOpened"
                >
                    {{ code.language }}
                </button>
                <button
                    :class="`flex items-center justify-center rounded-lg bg-spacex-primary px-4 py-2 text-center outline-none ring-white focus:ring-2 ${
                        isSharing && 'cursor-not-allowed opacity-50'
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

const code = reactive({
    title: '',
    content: '',
    language: 'JavaScript',
    private: false,
    deleteAfterViews: '0',
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

const handleEditorLoad = (monaco: typeof Monaco) => {
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
            deleteAfterViews: +code.deleteAfterViews,
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

const handleClickOutside = (e: any) => {
    if (
        isDropdownOpened.value &&
        !e.target.closest('#language-dropdown') &&
        !e.target.closest('#language-dropdown-toggler')
    ) {
        isDropdownOpened.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

watch(
    () => code.deleteAfterViews,
    (value) => {
        if (+value > 100000) {
            code.deleteAfterViews = '100000';
        } else if (value === '' || +value < 0) {
            code.deleteAfterViews = '0';
        }
    },
);

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
