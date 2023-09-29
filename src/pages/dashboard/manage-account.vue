<template>
    <h2>Manage Account</h2>
    <Modal :is-open="isModalOpened" @close="handleModalClose">
        <div class="flex flex-col justify-center p-4 md:p-8 w-full">
            <h3>
                {{
                    modalOperation === 'enable-2fa'
                        ? 'Enable Two-Factor Authentication'
                        : modalOperation === 'disable-2fa'
                        ? 'Disable Two-Factor Authentication'
                        : 'Update Credentials'
                }}
            </h3>
            <div
                v-if="modalOperation === 'enable-2fa'"
                class="mt-7 md:flex md:space-x-10 max-md:space-y-4 items-center"
            >
                <img
                    :src="twoFaQrCodeBase64"
                    class="w-40 h-40 rounded-md"
                    draggable="false"
                />
                <div>
                    <p class="font-semibold uppercase text-slate-300 text-sm">
                        SCAN THE QR CODE
                    </p>
                    <p class="mt-2 text-slate-200">
                        Scan the QR code with your authenticator app to complete
                        the process.
                    </p>
                </div>
            </div>
            <form
                class="mt-7"
                @submit.prevent="
                    modalOperation === 'enable-2fa'
                        ? enable2FA()
                        : modalOperation === 'disable-2fa'
                        ? disable2FA()
                        : updateCredentials()
                "
            >
                <div class="flex flex-col">
                    <label
                        class="font-semibold uppercase text-slate-300 text-sm"
                    >
                        OTP CODE
                    </label>
                    <input
                        v-model="otpCode"
                        type="text"
                        :placeholder="`Enter the 6-digit verification code${
                            modalOperation === 'enable-2fa' ? ' generated' : ''
                        }`"
                        minlength="6"
                        maxlength="6"
                        :class="`h-10 mt-1.5 py-2 px-3 bg-spacex-2 rounded-md outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300 ${
                            is2FAUpdating && 'cursor-not-allowed'
                        }`"
                        :disabled="is2FAUpdating"
                    />
                </div>

                <button
                    :class="`mt-4 w-full py-2 px-4 bg-spacex-primary rounded-lg  transition-all flex items-center justify-center text-center ${
                        is2FAUpdating && 'opacity-50 cursor-not-allowed'
                    }`"
                    :disabled="is2FAUpdating"
                >
                    <span v-if="!is2FAUpdating">
                        {{
                            modalOperation === 'enable-2fa'
                                ? 'Enable Two-Factor Authentication'
                                : modalOperation === 'disable-2fa'
                                ? 'Disable Two-Factor Authentication'
                                : 'Update Credentials'
                        }}
                    </span>
                    <Spinner v-else :size="24" color="#fff" />
                </button>
            </form>
        </div>
    </Modal>
    <div class="mt-6 flex flex-col space-y-5">
        <div class="rounded-lg bg-spacex-3 z-20">
            <div
                class="flex items-center cursor-pointer select-none p-4"
                @click="toggleItem('update-credentials')"
            >
                <div class="flex items-center space-x-3">
                    <Icon class="w-6 h-6" name="credentials" />
                    <h2 class="!text-lg font-semibold">Update Credentials</h2>
                </div>
                <button
                    class="bg-spacex-2 p-2 flex items-center justify-center h-8 w-8 rounded-md ml-auto"
                >
                    <Icon
                        id="update-credentials-toggler"
                        name="chevron-down"
                        class="text-sm"
                    />
                </button>
            </div>
            <div id="update-credentials-container" class="hidden h-0 opacity-0">
                <form
                    id="update-credentials-content"
                    class="w-full opacity-0 px-4 pb-4"
                    @submit.prevent="updateCredentials"
                >
                    <div
                        class="grid-cols-2 max-sm:grid-cols-1 grid gap-2 w-full"
                    >
                        <div class="flex flex-col">
                            <label
                                class="font-semibold uppercase text-slate-300 text-sm"
                            >
                                Username
                            </label>
                            <input
                                v-model="credentials.username"
                                type="text"
                                placeholder="Enter username"
                                :class="`h-10 mt-1.5 py-2 px-3 bg-spacex-2 rounded-md outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300 ${
                                    isCredentialsUpdating &&
                                    'cursor-not-allowed'
                                }`"
                                :disabled="isCredentialsUpdating"
                            />
                        </div>
                        <div class="flex flex-col">
                            <label
                                class="font-semibold uppercase text-slate-300 text-sm"
                            >
                                Password
                            </label>
                            <input
                                v-model="credentials.password"
                                type="password"
                                placeholder="Enter password"
                                :class="`h-10 mt-1.5 py-2 px-3 bg-spacex-2 rounded-md outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300 ${
                                    isCredentialsUpdating &&
                                    'cursor-not-allowed'
                                }`"
                                :disabled="isCredentialsUpdating"
                            />
                            <span
                                class="text-sm font-medium text-slate-300 mt-1"
                            >
                                If you leave it blank, your current password
                                will be used.
                            </span>
                        </div>
                    </div>
                    <button
                        :class="`mt-4 w-full py-2 px-4 bg-spacex-primary rounded-lg transition-all flex items-center justify-center text-center ${
                            isCredentialsUpdating &&
                            'opacity-50 cursor-not-allowed'
                        }`"
                        :disabled="isCredentialsUpdating"
                    >
                        <span v-if="!isCredentialsUpdating">
                            Update Credentials
                        </span>
                        <Spinner v-else :size="24" color="#fff" />
                    </button>
                </form>
            </div>
        </div>
        <div class="rounded-lg bg-spacex-3 z-20">
            <div
                class="flex items-center cursor-pointer select-none p-4"
                @click="toggleItem('2fa')"
            >
                <div class="flex items-center space-x-3">
                    <Icon class="w-6 h-6" name="shield" />
                    <h2 class="!text-lg font-semibold">
                        Two-Factor Authentication System
                    </h2>
                </div>
                <button
                    class="bg-spacex-2 p-2 flex items-center justify-center h-8 w-8 rounded-md ml-auto"
                >
                    <Icon
                        id="2fa-toggler"
                        name="chevron-down"
                        class="text-sm"
                    />
                </button>
            </div>
            <div id="2fa-container" class="hidden h-0 opacity-0">
                <div id="2fa-content" class="w-full opacity-0 px-4 pb-4">
                    <div class="w-fit flex items-center gap-2">
                        <Switch
                            v-model:is-checked="userStore.twoFaEnabled"
                            :disabled="is2FAQrCodeLoading"
                            @update:is-checked="handle2FAChange"
                        />
                        <h6>Enable 2FA</h6>
                    </div>
                </div>
            </div>
        </div>
        <div class="rounded-lg bg-spacex-3 z-20">
            <div
                class="flex items-center cursor-pointer select-none p-4"
                @click="toggleItem('embed-config')"
            >
                <div class="flex items-center space-x-3">
                    <Icon class="w-6 h-6" name="embed" />
                    <h2 class="!text-lg font-semibold">Embed Config</h2>
                </div>
                <button
                    class="bg-spacex-2 p-2 flex items-center justify-center h-8 w-8 rounded-md ml-auto"
                >
                    <Icon
                        id="embed-config-toggler"
                        name="chevron-down"
                        class="text-sm"
                    />
                </button>
            </div>
            <div id="embed-config-container" class="hidden h-0 opacity-0">
                <form
                    id="embed-config-content"
                    class="w-full opacity-0 px-4 pb-4"
                    @submit.prevent="updateEmbedConfig"
                >
                    <div
                        class="grid-cols-2 max-sm:grid-cols-1 grid gap-2 w-full"
                    >
                        <div class="flex flex-col">
                            <label
                                class="font-semibold uppercase text-slate-300 text-sm"
                            >
                                Title
                            </label>
                            <input
                                v-model="embedConfigStore.embedConfig!.title"
                                type="text"
                                placeholder="Enter title"
                                :class="`h-10 mt-1.5 py-2 px-3 bg-spacex-2 rounded-md outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300 ${
                                    isEmbedConfigUpdating &&
                                    'cursor-not-allowed'
                                }`"
                                :disabled="isEmbedConfigUpdating"
                            />
                        </div>

                        <div class="flex flex-col">
                            <label
                                class="font-semibold uppercase text-slate-300 text-sm"
                            >
                                Description
                            </label>
                            <input
                                v-model="
                                    embedConfigStore.embedConfig!.description
                                "
                                type="text"
                                placeholder="Enter description"
                                :class="`h-10 mt-1.5 py-2 px-3 bg-spacex-2 rounded-md outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300 ${
                                    isEmbedConfigUpdating &&
                                    'cursor-not-allowed'
                                }`"
                                :disabled="isEmbedConfigUpdating"
                            />
                        </div>
                        <div class="flex flex-col mt-4">
                            <label
                                class="font-semibold uppercase text-slate-300 text-sm"
                            >
                                Site Name
                            </label>
                            <input
                                v-model="
                                    embedConfigStore.embedConfig!.site_name
                                "
                                type="text"
                                placeholder="Enter site name"
                                :class="`h-10 mt-1.5 py-2 px-3 bg-spacex-2 rounded-md outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300 ${
                                    isEmbedConfigUpdating &&
                                    'cursor-not-allowed'
                                }`"
                                :disabled="isEmbedConfigUpdating"
                            />
                        </div>
                        <div class="flex flex-col mt-4 relative w-full">
                            <label
                                class="font-semibold uppercase text-slate-300 text-sm"
                            >
                                Color
                            </label>
                            <input
                                id="color-picker-trigger"
                                type="text"
                                maxlength="7"
                                :value="embedConfigStore.embedConfig!.color"
                                :style="{
                                    boxShadow: `0 0 0 2px ${
                                        embedConfigStore.embedConfig!.color
                                    }`,
                                }"
                                :class="`z-10 h-10 pl-10 mt-1.5 py-2 px-4 bg-spacex-2 rounded-md outline-none placeholder-slate-300 ${
                                    isEmbedConfigUpdating &&
                                    'cursor-not-allowed'
                                }`"
                                @change="updateColor"
                                @click="openColorPicker"
                            />
                            <div
                                class="z-10 absolute w-5 h-5 top-[36px] left-[10px] rounded-full"
                                :style="{
                                    backgroundColor:
                                        embedConfigStore.embedConfig!.color,
                                }"
                            ></div>
                            <div
                                v-if="isColorPickerOpened"
                                id="color-picker-container"
                                class="absolute top-20 z-50 left-0 bg-spacex-3 p-2 rounded-xl hidden"
                                :style="{
                                    boxShadow: `0 0 0 2px ${
                                        embedConfigStore.embedConfig!.color
                                    }`,
                                }"
                            >
                                <ColorPicker
                                    id="color-picker"
                                    v-model:color="
                                        embedConfigStore.embedConfig!.color
                                    "
                                />
                            </div>
                        </div>
                    </div>

                    <h6 class="mt-4 max-md:hidden">Embed Preview</h6>
                    <div
                        class="bg-[#313338] hidden md:flex w-full h-full p-4 cursor-default font-ggsans rounded-md mt-1.5"
                    >
                        <div class="flex space-x-3.5 h-fit">
                            <img
                                src="/icon-512x512.png"
                                class="w-10 h-10 rounded-full"
                                draggable="false"
                            />
                            <div class="flex flex-col">
                                <div
                                    class="flex items-center space-x-2 font-ggsans-medium w-fit"
                                >
                                    <span
                                        class="font-medium text-[1rem] leading-[1.375rem] hover:underline"
                                    >
                                        {{ _.capitalize(credentials.username) }}
                                    </span>
                                    <span
                                        class="font-medium text-xs text-[#949ba4]"
                                    >
                                        Today at {{ currentTime }}
                                    </span>
                                </div>

                                <span
                                    class="text-[1rem] leading-[1.375rem] text-[#00a8fc] hover:underline w-fit"
                                >
                                    {{ SITE_URL }}/u/embed-preview.png
                                </span>
                                <img
                                    v-if="
                                        !embedConfigStore.embedConfig!.enabled
                                    "
                                    src="/spacex.png"
                                    class="rounded-[4px] w-[516px] mt-0.5"
                                    draggable="false"
                                />
                                <div
                                    v-if="embedConfigStore.embedConfig!.enabled"
                                    class="flex flex-col mt-0.5 text-sm text-[#dddedf] w-[516px] p-4 bg-[#2b2d31] rounded-[4px] border-l-4"
                                    :style="{
                                        borderColor:
                                            embedConfigStore.embedConfig!.color,
                                    }"
                                >
                                    <span
                                        v-if="
                                            embedConfigStore.embedConfig!
                                                .site_name.length
                                        "
                                        class="text-xs w-fit"
                                    >
                                        {{
                                            replaceString(
                                                embedConfigStore.embedConfig!
                                                    .site_name,
                                                {
                                                    id: 'embed-preview.png',
                                                    date: currentDate.getTime(),
                                                    size: {
                                                        formatted: '1 MB',
                                                    },
                                                    type: 'image/png',
                                                } as any,
                                            )
                                        }}
                                    </span>
                                    <span
                                        v-if="
                                            embedConfigStore.embedConfig!.title
                                                .length
                                        "
                                        class="font-ggsans-semibold text-[#00a8fc] hover:underline w-fit"
                                    >
                                        {{
                                            replaceString(
                                                embedConfigStore.embedConfig!
                                                    .title,
                                                {
                                                    id: 'embed-preview.png',
                                                    date: currentDate.getTime(),
                                                    size: {
                                                        formatted: '1 MB',
                                                    },
                                                    type: 'image/png',
                                                } as any,
                                            )
                                        }}
                                    </span>
                                    <span
                                        v-if="
                                            embedConfigStore.embedConfig!
                                                .description.length
                                        "
                                        class="text-[0.875rem] leading-[1.125rem] w-fit"
                                        :style="{
                                            marginTop:
                                                (embedConfigStore.embedConfig!
                                                    .title.length ||
                                                    embedConfigStore.embedConfig!
                                                        .site_name.length) &&
                                                '0.5rem',
                                        }"
                                    >
                                        {{
                                            replaceString(
                                                embedConfigStore.embedConfig!
                                                    .description,
                                                {
                                                    id: 'embed-preview.png',
                                                    date: currentDate.getTime(),
                                                    size: {
                                                        formatted: '1 MB',
                                                    },
                                                    type: 'image/png',
                                                } as any,
                                            )
                                        }}
                                    </span>
                                    <img
                                        src="/spacex.png"
                                        class="rounded-[4px]"
                                        draggable="false"
                                        :style="{
                                            marginTop:
                                                (embedConfigStore.embedConfig!
                                                    .title.length ||
                                                    embedConfigStore.embedConfig!
                                                        .description.length ||
                                                    embedConfigStore.embedConfig!
                                                        .site_name.length) &&
                                                '1rem',
                                        }"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <h6 class="mt-4">
                        Parameters:
                        <span class="font-medium">
                            filename, filesize, filetype, filedate, date
                        </span>
                    </h6>

                    <div class="mt-8 w-fit flex items-center gap-2">
                        <Switch
                            v-model:is-checked="
                                embedConfigStore.embedConfig!.enabled
                            "
                        />
                        <h6>Enable Embeds</h6>
                    </div>
                    <button
                        :class="`w-full mt-4 py-2 px-4 bg-spacex-primary rounded-lg transition-all flex items-center justify-center text-center ${
                            isEmbedConfigUpdating &&
                            'opacity-50 cursor-not-allowed'
                        }`"
                        :disabled="isEmbedConfigUpdating"
                    >
                        <span v-if="!isEmbedConfigUpdating">
                            Update Embed Config
                        </span>
                        <Spinner v-else :size="24" color="#fff" />
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import gsap from 'gsap';
import _ from 'lodash';
import { useEmbedConfigStore, useUserStore } from '@/store';
import { replaceString } from '@/util/replace-string';
import { fire } from '@/util/toast';

const embedConfigStore = useEmbedConfigStore();
const userStore = useUserStore();

await embedConfigStore.fetchEmbedConfig();

const credentials = reactive({
    username: userStore.username,
    password: '',
});

const dateUpdateInterval = ref(0);
const currentDate = ref(new Date());
const currentTime = computed(() =>
    currentDate.value.toLocaleTimeString('en-US'),
);

const activeItem = ref('');

const isCredentialsUpdating = ref(false);
const isEmbedConfigUpdating = ref(false);
const isColorPickerOpened = ref(false);

const isModalOpened = ref(false);
const is2FAQrCodeLoading = ref(false);
const is2FAUpdating = ref(false);
const modalOperation = ref<
    'enable-2fa' | 'disable-2fa' | 'update-credentials-2fa'
>();
const twoFaQrCodeBase64 = ref('');
const otpCode = ref('');
const twoFaState = ref(userStore.twoFaEnabled);

const SITE_URL = import.meta.env.VITE_SITE_URL;

const enable2FA = async () => {
    is2FAUpdating.value = true;

    const json = await useAPI('/auth/2fa/enable', {
        method: 'POST',
        body: {
            otp: otpCode.value,
        },
        auth: true,
    });

    if (json?.error) {
        is2FAUpdating.value = false;
        fire(json.error, { type: 'error' });
    } else {
        twoFaState.value = true;
        handleModalClose();

        fire(
            'Two-factor authentication system has been enabled successfully!',
            {
                type: 'success',
            },
        );
    }
};

const disable2FA = async () => {
    is2FAUpdating.value = true;

    const json = await useAPI('/auth/2fa/disable', {
        method: 'POST',
        body: {
            otp: otpCode.value,
        },
        auth: true,
    });

    if (json?.error) {
        is2FAUpdating.value = false;
        fire(json.error, { type: 'error' });
    } else {
        twoFaState.value = false;
        handleModalClose();

        fire(
            'Two-factor authentication system has been disabled successfully!',
            {
                type: 'success',
            },
        );
    }
};

const handle2FAChange = async (enabled: boolean) => {
    if (modalOperation.value || is2FAUpdating.value) {
        return;
    }

    modalOperation.value = enabled ? 'enable-2fa' : 'disable-2fa';

    if (enabled) {
        is2FAQrCodeLoading.value = true;

        const json = await useAPI(`/auth/2fa/qrcode`, {
            auth: true,
        });

        if (json?.error) {
            handleModalClose();
            fire(json.error, { type: 'error' });
        } else {
            twoFaQrCodeBase64.value = json.base64;
            isModalOpened.value = true;
        }

        is2FAQrCodeLoading.value = true;
    } else {
        isModalOpened.value = true;
    }
};

const handleModalClose = async () => {
    isModalOpened.value = false;

    if (
        modalOperation.value === 'enable-2fa' ||
        modalOperation.value === 'disable-2fa'
    ) {
        userStore.twoFaEnabled = twoFaState.value;
    }

    await nextTick();

    setTimeout(() => {
        if (modalOperation.value === 'update-credentials-2fa') {
            isCredentialsUpdating.value = false;
        } else if (
            modalOperation.value === 'enable-2fa' ||
            modalOperation.value === 'disable-2fa'
        ) {
            twoFaQrCodeBase64.value = '';
            is2FAQrCodeLoading.value = false;
        }

        otpCode.value = '';
        is2FAUpdating.value = false;
        modalOperation.value = undefined;
    }, 300);
};

const updateColor = (e: any) => {
    embedConfigStore.embedConfig!.color = `#${
        e.target!.value.startsWith('#')
            ? e.target!.value.slice(1)
            : e.target!.value
    }`;
};

const openItem = (id: string) => {
    const itemContainer = document.getElementById(`${id}-container`);
    const item = document.getElementById(`${id}-content`);
    const toggler = document.getElementById(`${id}-toggler`);

    if (item && toggler) {
        gsap.set(itemContainer, {
            display: 'block',
        });

        const height = item.offsetHeight;

        gsap.to(itemContainer, {
            duration: 0.3,
            height: `${height}px`,
            display: 'block',
            opacity: 1,
            onComplete: () => {
                gsap.to(item, {
                    opacity: 1,
                    duration: 0.2,
                });
            },
        });

        gsap.to(toggler, {
            rotate: 180,
            duration: 0.2,
        });
    }
};

const closeItem = (id: string) => {
    const itemContainer = document.getElementById(`${id}-container`);
    const item = document.getElementById(`${id}-content`);
    const toggler = document.getElementById(`${id}-toggler`);

    if (item && toggler) {
        gsap.to(item, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                gsap.to(itemContainer, {
                    duration: 0.3,
                    height: 0,
                    opacity: 0,
                    display: 'none',
                });
            },
        });

        gsap.to(toggler, {
            rotate: 0,
            duration: 0.3,
        });
    }
};

const toggleItem = (id: string) => {
    if (activeItem.value.length) {
        closeItem(activeItem.value);
    }

    if (activeItem.value !== id) {
        openItem(id);
    }

    activeItem.value = activeItem.value === id ? '' : id;
};

const updateCredentials = async () => {
    isCredentialsUpdating.value = true;

    if (userStore.twoFaEnabled && !isModalOpened.value) {
        modalOperation.value = 'update-credentials-2fa';
        isModalOpened.value = true;
        return;
    } else if (userStore.twoFaEnabled) {
        is2FAUpdating.value = true;
    }

    const json = await useAPI('/auth/update-credentials', {
        method: 'PATCH',
        body: {
            ...credentials,
            otp: otpCode.value,
        },
        auth: true,
    });

    if (json?.error) {
        if (!userStore.twoFaEnabled) {
            isCredentialsUpdating.value = false;
        } else {
            is2FAUpdating.value = false;
        }

        fire(json.error, { type: 'error' });
    } else {
        fire(
            'Credentials has been updated successfully! You will be logged out.',
            {
                type: 'success',
            },
        );
    }
};

const updateEmbedConfig = async () => {
    if (!/^#[0-9A-F]{6}$/i.test(embedConfigStore.embedConfig!.color)) {
        fire('Please select a valid color!', {
            type: 'error',
        });
    } else {
        isEmbedConfigUpdating.value = true;

        const json = await useAPI('/embed-config', {
            method: 'PATCH',
            body: embedConfigStore.embedConfig,
            auth: true,
        });

        isEmbedConfigUpdating.value = false;

        if (json?.error) {
            fire(json.error, {
                type: 'error',
            });
        } else {
            fire('Embed config has been updated successfully!', {
                type: 'success',
            });
        }
    }
};

const closeColorPicker = async () => {
    await gsap.to('#color-picker-container', {
        opacity: 0,
        duration: 0.2,
        y: '-1rem',
        display: 'none',
    });

    isColorPickerOpened.value = false;
};

const openColorPicker = () => {
    if (!isColorPickerOpened.value) {
        isColorPickerOpened.value = true;

        nextTick(() => {
            gsap.fromTo(
                '#color-picker-container',
                {
                    y: '-1rem',
                },
                {
                    display: 'flex',
                    opacity: 1,
                    duration: 0.2,
                    y: 0,
                },
            );
        });
    }
};

const onClick = (e: any) => {
    if (
        isColorPickerOpened.value &&
        !e.target.closest('#color-picker') &&
        !e.target.closest('#color-picker-container') &&
        !e.target.closest('#color-picker-trigger')
    ) {
        closeColorPicker();
    }
};

watch(otpCode, (otp) => {
    if (otp.length === 6) {
        if (modalOperation.value === 'enable-2fa') {
            enable2FA();
        } else if (modalOperation.value === 'disable-2fa') {
            disable2FA();
        } else if (modalOperation.value === 'update-credentials-2fa') {
            updateCredentials();
        }
    }
});

watch(
    () => embedConfigStore.embedConfig!.enabled,
    async () => {
        await nextTick();

        if (activeItem.value === 'embed-config') {
            const item = document.getElementById(
                `${activeItem.value}-content`,
            )!;

            gsap.set(`#${activeItem.value}-container`, {
                height: `${item.offsetHeight}px`,
            });
        }
    },
);

watch(
    () => userStore.username,
    () => {
        credentials.username = userStore.username;
    },
);

onMounted(() => {
    document.addEventListener('click', onClick);
    dateUpdateInterval.value = window.setInterval(() => {
        currentDate.value = new Date();
    }, 1000);
});

onUnmounted(() => {
    document.removeEventListener('click', onClick);
    window.clearInterval(dateUpdateInterval.value);
});

definePageMeta({
    layout: 'dashboard',
});

useHead({
    title: 'Manage Account',
    meta: [
        {
            name: 'og:title',
            content: 'Manage Account | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
