<template>
    <nav
        id="navbar"
        class="relative flex z-50 h-[70px] w-full items-center bg-spacex-3 pl-4 lg:px-6 max-lg:pr-6"
    >
        <svg
            id="sidebar-toggler"
            class="cursor-pointer transition-transform duration-300 lg:hidden"
            viewBox="0 0 100 100"
            width="42"
            aria-label="Toggle sidebar"
            :aria-expanded="sidebarStore.opened"
            @click="sidebarStore.opened = !sidebarStore.opened"
        >
            <path
                id="top"
                class="line"
                d="m 30,33 h 40 c 0,0 8.5,-0.68551 8.5,10.375 0,8.292653 -6.122707,9.002293 -8.5,6.625 l -11.071429,-11.071429"
            />
            <path class="line" d="m 70,50 h -40" />
            <path
                id="bottom"
                class="line"
                d="m 30,67 h 40 c 0,0 8.5,0.68551 8.5,-10.375 0,-8.292653 -6.122707,-9.002293 -8.5,-6.625 l -11.071429,11.071429"
            />
        </svg>
        <h2 class="max-lg:mx-auto max-lg:!text-2xl lg:font-bold">SpaceX</h2>
        <div class="relative lg:ml-auto">
            <img
                src="/favicon.ico"
                width="32"
                height="32"
                alt=""
                class="cursor-pointer rounded-full ring-[3px] ring-spacex-primary"
                draggable="false"
                @click="handleProfile"
            />
            <div
                id="profile"
                class="absolute right-0 z-50 mt-4 hidden shadow-md"
            >
                <div
                    class="flex w-52 flex-col justify-center rounded-lg bg-spacex-3 p-2.5 shadow-lg ring-2 ring-spacex-primary"
                >
                    <h4 class="px-2.5">
                        {{ _.upperFirst(userStore.username) }}
                    </h4>

                    <hr class="my-2 h-[1px] border-0 bg-spacex-1" />

                    <div class="mt-1 flex flex-col items-center gap-2">
                        <NuxtLink
                            to="/dashboard/manage-account"
                            class="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 font-medium transition-colors hover:bg-spacex-2"
                        >
                            <Icon name="user" />
                            Manage Account
                        </NuxtLink>
                        <NuxtLink
                            to="/dashboard/stats"
                            class="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 font-medium transition-colors hover:bg-spacex-2"
                        >
                            <Icon name="stats" />
                            Statistics
                        </NuxtLink>
                        <NuxtLink
                            to="/dashboard/logs"
                            class="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 font-medium transition-colors hover:bg-spacex-2"
                        >
                            <Icon name="book" />
                            Logs
                        </NuxtLink>
                        <NuxtLink
                            class="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 font-medium transition-colors hover:bg-spacex-2"
                            to="/dashboard/backups"
                        >
                            <Icon name="folder-zip" />
                            Backups
                        </NuxtLink>
                        <NuxtLink
                            class="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 font-medium transition-colors hover:bg-spacex-2"
                            to="/dashboard/system-monitor"
                        >
                            <Icon name="monitor" />
                            System Monitor
                        </NuxtLink>
                        <button
                            class="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 font-medium transition-colors hover:bg-spacex-2 focus:bg-spacex-primary"
                            @click="createSXCU"
                        >
                            <Icon name="settings" />
                            Create SXCU
                        </button>
                        <div class="relative w-full">
                            <div
                                id="themes"
                                class="absolute right-0 z-50 mr-52 hidden shadow-md max-sm:-top-[17.45rem]"
                            >
                                <div
                                    class="flex w-56 flex-col justify-center gap-2 rounded-lg bg-spacex-3 p-2.5 shadow-lg ring-2 ring-spacex-primary max-[472px]:w-48 max-[440px]:w-36"
                                >
                                    <button
                                        v-for="(
                                            [name, data], index
                                        ) in Object.entries(themes)"
                                        :key="index"
                                        :class="`flex h-9 w-full items-center gap-2 rounded-lg px-2.5 font-medium transition-colors hover:bg-spacex-2 ${
                                            name === theme &&
                                            'ring-2 ring-spacex-primary'
                                        }`"
                                        @click="setTheme(name)"
                                    >
                                        <div
                                            class="h-4 w-4 rounded-full"
                                            :style="{
                                                backgroundColor: data.primary,
                                            }"
                                        />
                                        {{ pascalCase(name) }}
                                    </button>
                                </div>
                            </div>

                            <button
                                class="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 font-medium transition-colors hover:bg-spacex-2 focus:ring-2 focus:ring-spacex-primary"
                                @click="handleThemes"
                            >
                                <Icon name="palette" />
                                Themes
                            </button>
                        </div>
                        <NuxtLink
                            to="/auth/logout"
                            class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-red-500 transition-colors hover:bg-spacex-2"
                        >
                            <Icon name="logout" />
                            Logout
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { render } from 'vue';
import gsap from 'gsap';
import _ from 'lodash';

import { useSidebarStore, useUserStore } from '@/store';
import { pascalCase } from '@/util/pascal-case';
import { applyTheme } from '@/util/apply-theme';
import { BASE_SXCU } from '@/constants';
import themeEmitter from '@/util/emitters/theme';
import themes from '@/assets/themes.json';

const userStore = useUserStore();
const sidebarStore = useSidebarStore();

const theme = ref('default');

const isProfileOpened = ref(false);
const isThemesOpened = ref(false);

const router = useRouter();

const closeProfile = async () => {
    if (isThemesOpened.value) {
        closeThemes();
        await new Promise((resolve) => setTimeout(resolve, 200));
    }

    isProfileOpened.value = false;

    gsap.to('#profile', {
        opacity: 0,
        duration: 0.2,
        y: '-1rem',
        onComplete: () => {
            gsap.set('#profile', { display: 'none' });
        },
    });
};

const openProfile = () => {
    isProfileOpened.value = true;

    gsap.set('#profile', {
        display: 'flex',
        y: '-1rem',
        onComplete: () => {
            gsap.to('#profile', {
                opacity: 1,
                duration: 0.2,
                y: 0,
            });
        },
    });
};

const closeThemes = () => {
    isThemesOpened.value = false;

    gsap.to('#themes', {
        opacity: 0,
        duration: 0.2,
        x: '1rem',
        onComplete: () => {
            gsap.set('#themes', { display: 'none' });
        },
    });
};

const openThemes = () => {
    isThemesOpened.value = true;

    gsap.set('#themes', {
        display: 'flex',
        x: '1rem',
        onComplete: () => {
            gsap.to('#themes', {
                opacity: 1,
                duration: 0.2,
                x: 0,
            });
        },
    });
};

const handleProfile = () => {
    if (isProfileOpened.value) {
        closeProfile();
    } else {
        openProfile();
    }
};

const handleThemes = () => {
    if (isThemesOpened.value) {
        closeThemes();
    } else {
        openThemes();
    }
};

const createSXCU = async () => {
    const fileUploaderSXCU: typeof BASE_SXCU & { FileFormName?: string } =
        _.cloneDeep(BASE_SXCU);

    const urlShortenerSXCU: typeof BASE_SXCU & { Data?: string } =
        _.cloneDeep(BASE_SXCU);

    fileUploaderSXCU.Name = fileUploaderSXCU.Name.replace(
        '{name}',
        'File Uploader',
    );
    fileUploaderSXCU.DestinationType =
        'ImageUploader, TextUploader, FileUploader';
    fileUploaderSXCU.RequestURL += '/uploads';
    fileUploaderSXCU.Headers.Authorization = useCookie('token').value!;
    fileUploaderSXCU.Body = 'MultipartFormData';
    fileUploaderSXCU.FileFormName = 'file';
    fileUploaderSXCU.URL = '{json:url}';

    urlShortenerSXCU.Name = urlShortenerSXCU.Name.replace(
        '{name}',
        'URL Shortener',
    );
    urlShortenerSXCU.DestinationType = 'URLShortener';
    urlShortenerSXCU.RequestURL += '/shortened-urls';
    urlShortenerSXCU.Headers.Authorization = useCookie('token').value!;
    urlShortenerSXCU.Body = 'JSON';
    urlShortenerSXCU.Data = JSON.stringify({ url: '{input}' });
    urlShortenerSXCU.URL = '{json:shortenedURL}';

    const fileUploaderVNode = h('a', {
        href: URL.createObjectURL(
            new Blob([JSON.stringify(fileUploaderSXCU)], {
                type: 'application/json',
            }),
        ),
        download: 'SpaceX_file_uploader.sxcu',
    });

    const urlShortenerVNode = h('a', {
        href: URL.createObjectURL(
            new Blob([JSON.stringify(urlShortenerSXCU)], {
                type: 'application/json',
            }),
        ),
        download: 'SpaceX_url_shortener.sxcu',
    });

    render(fileUploaderVNode, document.body);
    await nextTick();

    fileUploaderVNode.el!.click();
    fileUploaderVNode.el!.remove();

    render(urlShortenerVNode, document.body);
    await nextTick();

    urlShortenerVNode.el!.click();
    urlShortenerVNode.el!.remove();
};

const setTheme = (name: string) => {
    localStorage.setItem('theme', name);
    theme.value = name;

    applyTheme();

    themeEmitter.emit('change', name);
};

const onClickOutside = (event: any) => {
    if (
        isProfileOpened.value &&
        !event.target.closest('#navbar') &&
        !event.target.closest('#profile')
    ) {
        closeProfile();
    }
};

onMounted(() => {
    theme.value = localStorage.getItem('theme') || 'default';

    document.addEventListener('click', onClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', onClickOutside);
});

router.beforeEach(async (_, __, next) => {
    if (isProfileOpened.value) {
        await closeProfile();
    }

    next();
});
</script>

<style scoped>
#sidebar-toggler[aria-expanded='true'] {
    transform: rotate(180deg);
}

#sidebar-toggler .line {
    transition:
        stroke-dasharray 400ms,
        stroke-dashoffset 400ms;
    stroke-linecap: round;
    @apply fill-none stroke-white stroke-[5.5];
}

#sidebar-toggler #top {
    stroke-dasharray: 40 82;
}

#sidebar-toggler #bottom {
    stroke-dasharray: 40 82;
}

#sidebar-toggler[aria-expanded='true'] #top {
    stroke-dasharray: 14 82;
    stroke-dashoffset: -72px;
}

#sidebar-toggler[aria-expanded='true'] #bottom {
    stroke-dasharray: 14 82;
    stroke-dashoffset: -72px;
}
</style>
