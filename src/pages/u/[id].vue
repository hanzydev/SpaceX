<template>
    <div
        v-if="!json?.error"
        class="absolute flex h-screen w-screen items-center justify-center"
    >
        <img
            v-if="json.type.includes('image')"
            class="max-h-full max-w-full"
            :src="`${API_URL}/uploads/${json.id}?ref=cdn${
                json.private ? `&token=${useCookie('token').value!}` : ''
            }`"
            :alt="json.id"
        />
        <video
            v-else-if="json.type.includes('video')"
            class="max-h-full max-w-full"
            controls
            :src="`${API_URL}/uploads/${json.id}?ref=cdn${
                json.private ? `&token=${useCookie('token').value!}` : ''
            }`"
        />
        <audio
            v-else-if="json.type.includes('audio')"
            controls
            :src="`${API_URL}/uploads/${json.id}?ref=cdn${
                json.private ? `&token=${useCookie('token').value!}` : ''
            }`"
        />
        <div
            v-else
            class="flex w-96 flex-col items-center justify-center rounded-xl bg-spacex-4 p-4 text-center max-xs:w-60"
        >
            <Icon
                v-if="
                    json.type.includes('text') ||
                    [
                        'json',
                        'xml',
                        'csv',
                        'html',
                        'css',
                        'js',
                        'md',
                        'txt',
                    ].includes(json.id.split('.').pop() ?? '')
                "
                name="file-text"
                class="text-6xl"
            />

            <Icon
                v-else-if="
                    ['zip', 'rar', '7z', 'tar', 'gz', 'bin'].includes(
                        json.id.split('.').pop() ?? '',
                    )
                "
                name="file-archive"
                class="text-6xl"
            />

            <Icon v-else name="file-unknown" class="text-6xl" />

            <h2 class="mt-1">{{ json.id }}</h2>
            <button
                class="mt-5 w-full rounded-lg bg-spacex-primary p-2 focus:ring-2 focus:ring-white"
                @click="handleDownload"
            >
                Download
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Meta } from '@unhead/vue';
import { replaceString } from '@/util/replace-string';

const route = useRoute();

const { data: jsonRef } = await useAsyncAPI<any>(
    `/uploads/${route.params.id}`,
    {
        headers: useRequestHeaders(['x-forwarded-for']),
        query: {
            log: true,
        },
        auth: true,
    },
);
const embedConfig = await useAPI('/embed-config');

const json = unref(jsonRef)!;

const API_URL = import.meta.env.VITE_API_URL;

const handleDownload = () => {
    window.open(
        `${API_URL}/uploads/${json.id}?ref=direct${
            json.private ? `&token=${useCookie('token').value!}` : ''
        }`,
        '_blank',
    );
};

if (json?.error) {
    throwError(404);
} else {
    json.url = `${API_URL}/uploads/${json.id}?ref=cdn`;

    const meta: Meta[] = [];

    if (embedConfig.enabled) {
        meta.push({
            name: 'theme-color',
            content: embedConfig.color,
        });

        if (embedConfig.title.length) {
            meta.push({
                name: 'og:title',
                content: replaceString(embedConfig.title, json),
            });
        } else {
            meta.push({
                name: 'og:title',
                content: json.id,
            });
        }

        if (embedConfig.description.length) {
            meta.push({
                name: 'og:description',
                content: replaceString(embedConfig.description, json),
            });
        }

        if (embedConfig.site_name.length) {
            const replaced = replaceString(embedConfig.site_name, json);

            meta.push({
                name: 'og:site_name',
                content: replaced,
            });

            meta.push({
                name: 'twitter:site',
                content: replaced,
            });
        }
    }

    if (json.type.startsWith('image')) {
        meta.push({
            name: 'og:image',
            content: json.url,
        });

        meta.push({
            name: 'twitter:card',
            content: 'summary_large_image',
        });
    }

    if (json.type.startsWith('video')) {
        meta.push({ name: 'og:url', content: json.url });
        meta.push({ name: 'og:video', content: json.url });
        meta.push({
            name: 'og:video:url',
            content: json.url,
        });
        meta.push({
            name: 'og:video:secure_url',
            content: json.url,
        });
        meta.push({
            name: 'og:video:type',
            content: json.type,
        });
        meta.push({ name: 'og:video:width', content: '720' });
        meta.push({ name: 'og:video:height', content: '480' });
    }

    if (json.type.startsWith('audio')) {
        meta.push({ name: 'og:url', content: json.url });
        meta.push({ name: 'og:audio', content: json.url });
        meta.push({
            name: 'og:audio:url',
            content: json.url,
        });
        meta.push({
            name: 'og:audio:secure_url',
            content: json.url,
        });
        meta.push({
            name: 'og:audio:type',
            content: json.type,
        });
    }

    if (json.type.startsWith('video') || json.type.startsWith('audio')) {
        meta.push({ name: 'twitter:card', content: 'player' });
        meta.push({
            name: 'twitter:player:stream',
            content: json.url,
        });
        meta.push({ name: 'twitter:player:width', content: '720' });
        meta.push({ name: 'twitter:player:height', content: '480' });
        meta.push({
            name: 'twitter:player:stream:content_type',
            content: json.type,
        });
        meta.push({
            name: 'twitter:title',
            content: json.id,
        });

        if (!meta.find((m: any) => m.name === 'theme-color')) {
            meta.push({
                name: 'theme-color',
                content: embedConfig.color,
            });
        }
    }

    useHead({
        title: json.id,
        meta,
    });
}
</script>
