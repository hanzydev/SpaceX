<template>
    <div v-show="editorIsLoaded" ref="editorRef" class="h-full w-full" />
    <slot v-if="!editorIsLoaded" name="loading" />
</template>

<script setup lang="ts">
import loader from '@monaco-editor/loader';
import type * as _monaco from 'monaco-editor';
import type { Omit } from '@/types';

const {
    value,
    language,
    options = {},
    rounded = '8px',
} = defineProps<{
    value: string;
    language: string;
    rounded?: string;
    options?: Omit<
        _monaco.editor.IStandaloneEditorConstructionOptions,
        ['value', 'language']
    >;
}>();

const emit = defineEmits<{
    (event: 'update:value', code: string): void;
    (
        event: 'load',
        monaco: typeof _monaco,
        editor: _monaco.editor.IStandaloneCodeEditor,
    ): void;
}>();

const editorRef = ref<HTMLDivElement>();
const editorIsLoaded = ref(false);

let editor: _monaco.editor.IStandaloneCodeEditor;
let monaco: typeof _monaco;

const onResize = () => {
    editor.layout();
};

watch(
    () => editorRef.value,
    async () => {
        loader.config({
            paths: {
                vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs',
            },
        });

        monaco = await loader.init();

        editor = monaco.editor.create(editorRef.value!, {
            ...options,
            language,
            value,
        });

        editor.onDidChangeModelContent(() => {
            emit('update:value', editor.getValue());
        });

        window.addEventListener('resize', onResize);

        setTimeout(async () => {
            editorIsLoaded.value = true;
            emit('load', monaco, editor);

            await nextTick();
            editor.layout();

            const monacoEditor = editorRef.value!.querySelector(
                '.monaco-editor',
            ) as HTMLDivElement;

            if (monacoEditor) {
                monacoEditor.style.borderRadius = rounded;

                const overflowGuard = monacoEditor.querySelector(
                    '.overflow-guard',
                ) as HTMLDivElement;

                if (overflowGuard) {
                    overflowGuard.style.borderRadius = rounded;
                }
            }
        }, 600);
    },
);

onUnmounted(() => {
    if (editor) {
        editor.dispose();
    }

    window.removeEventListener('resize', onResize);
});

watch(
    () => language,
    (newLanguage) => {
        if (editor) {
            monaco.editor.setModelLanguage(editor.getModel()!, newLanguage);
        }
    },
);

watch(
    () => options,
    (newOptions) => {
        if (editor) {
            editor.updateOptions(newOptions);
        }
    },
);
</script>
