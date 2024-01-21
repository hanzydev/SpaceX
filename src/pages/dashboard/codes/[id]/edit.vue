<template>
    <div
        class="flex min-h-screen w-screen flex-col items-center justify-center p-4"
    >
        <GoBack to="/dashboard/codes" />
        <form
            class="flex w-[50rem] flex-col rounded-xl bg-spacex-4 p-10 max-lg:w-[30rem] max-sm:w-80"
            @submit.prevent="handleEdit"
        >
            <h1 class="mx-auto max-sm:!text-3xl">Edit Code</h1>

            <div class="mt-7 flex flex-col">
                <label class="text-sm font-semibold uppercase text-slate-300"
                    >Title</label
                >
                <input
                    v-model="code.title"
                    type="text"
                    placeholder="Enter Title"
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
                    class="relative mt-1 flex h-[50vh] w-full items-center justify-center"
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

            <button
                :class="`mt-8 flex items-center justify-center rounded-lg bg-spacex-primary px-4 py-2 text-center outline-none ring-white focus:ring-2 ${
                    isEditing && 'cursor-not-allowed opacity-50'
                }`"
                :disabled="isEditing"
            >
                <span v-if="!isEditing">Edit Code</span>
                <Spinner v-else :size="24" color="#fff" />
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import * as Monaco from 'monaco-editor';
import monacoTheme from '@/assets/monaco.json';
import { fire } from '@/util/toast';
import codeEmitter from '@/util/emitters/code';

const router = useRouter();
const route = useRoute();

const code = reactive({
    title: '',
    content: '',
    language: '',
    private: false,
    deleteAfterViews: '0',
});

const isEditing = ref(false);

const json = await useAPI(`/codes/${route.params.id}`, {
    auth: true,
});

if (json?.error) {
    throw createError({ statusCode: 404 });
} else {
    code.title = json.title;
    code.content = json.content;
    code.language = json.language;
    code.private = json.private;
    code.deleteAfterViews = json.deleteAfterViews.toString();

    codeEmitter.on(
        'UPDATE_CODE',
        ({
            id,
            title,
            content,
            private: newIsPrivate,
            deleteAfterViews: newDeleteAfterViews,
        }) => {
            if (id === json.id && !isEditing.value) {
                code.title = title;
                code.content = content;
                code.private = newIsPrivate;
                code.deleteAfterViews = newDeleteAfterViews.toString();
            }
        },
    );

    codeEmitter.on('DELETE_CODE', (codeId) => {
        if (codeId === json.id) {
            router.push('/dashboard/codes');
        }
    });
}

const handleEditorLoad = (monaco: typeof Monaco) => {
    monaco.editor.defineTheme('spacex', monacoTheme as any);
    monaco.editor.setTheme('spacex');
};

const handleEdit = async () => {
    isEditing.value = true;

    const json = await useAPI(`/codes/${route.params.id}`, {
        method: 'PATCH',
        body: {
            ...code,
            language: code.language.toLowerCase(),
            deleteAfterViews: +code.deleteAfterViews,
        },
        auth: true,
    });

    isEditing.value = false;

    if (json?.error) {
        fire(json.error, {
            type: 'error',
        });
    } else {
        await router.push('/dashboard/codes');

        fire('Code has been edited successfully!', {
            type: 'success',
        });
    }
};

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
    title: 'Edit Code',
    meta: [
        {
            name: 'og:title',
            content: 'Edit Code | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
