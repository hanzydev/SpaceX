<template>
    <div
        v-if="!json?.error"
        class="absolute w-screen h-screen flex justify-center items-center"
    >
        <MonacoEditor
            class="w-full h-full"
            :value="json?.content!"
            :language="json?.language.toLowerCase()!"
            :options="{ theme: 'spacex', readOnly: true }"
            @load="onEditorLoad"
        >
            <template #loading>
                <div class="flex items-center justify-center w-full h-full">
                    <Spinner :size="64" />
                </div>
            </template>
        </MonacoEditor>
    </div>
</template>

<script setup lang="ts">
import * as Monaco from 'monaco-editor';
import monacoTheme from '@/assets/monaco.json';

const route = useRoute();

const { data: jsonRef } = await useAsyncAPI<any>(`/codes/${route.params.id}`, {
    query: {
        log: true,
    },
});

const json = unref(jsonRef)!;

const onEditorLoad = (monaco: typeof Monaco) => {
    monaco.editor.defineTheme('spacex', monacoTheme as any);
    monaco.editor.setTheme('spacex');
};

if (json?.error) {
    throwError(404);
} else {
    useHead({
        title: json.title,
        meta: [
            {
                name: 'og:title',
                content: json.title,
            },
            {
                name: 'theme-color',
                content: '#5e58f9',
            },
        ],
    });
}
</script>
