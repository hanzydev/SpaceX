<template>
    <GoBack v-if="page === '2fa'" to="/auth/login" @click="page = 'login'" />
    <div
        class="flex flex-col items-center absolute justify-center min-h-screen w-full px-4 pt-4"
    >
        <form
            v-if="page === 'login'"
            class="flex flex-col bg-spacex-4 p-10 max-sm:w-80 w-[30rem] rounded-xl mt-auto"
            @submit.prevent="handleLogin"
        >
            <h1 class="mx-auto max-sm:!text-3xl">SpaceX - Login</h1>
            <div class="mt-7 flex flex-col">
                <label class="font-semibold uppercase text-slate-300 text-sm">
                    Username
                </label>
                <input
                    v-model="credentials.username"
                    type="text"
                    placeholder="Enter username"
                    :class="`h-10 mt-1.5 py-2 px-3 bg-spacex-2 rounded-lg outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300 ${
                        isLoggingIn && 'cursor-not-allowed'
                    }`"
                    :disabled="isLoggingIn"
                />
            </div>
            <div class="mt-4 flex flex-col">
                <label class="font-semibold uppercase text-slate-300 text-sm">
                    Password
                </label>
                <input
                    v-model="credentials.password"
                    type="password"
                    placeholder="Enter password"
                    :class="`h-10 mt-1.5 py-2 px-3 bg-spacex-2 rounded-lg outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300 ${
                        isLoggingIn && 'cursor-not-allowed'
                    }`"
                    :disabled="isLoggingIn"
                />
            </div>
            <NuxtTurnstile
                ref="turnstileRef"
                v-model="credentials.cf_turnstile_token"
                class="mt-6 mx-auto"
                :options="{ theme: 'dark' }"
            />
            <button
                :class="`mt-6 py-2 px-4 bg-spacex-primary rounded-lg transition-all duration-300 flex items-center justify-center text-center ${
                    isLoggingIn && 'opacity-50 cursor-not-allowed'
                }`"
                :disabled="isLoggingIn"
            >
                <span v-if="!isLoggingIn">Login</span>
                <Spinner v-else :size="24" color="#fff" />
            </button>
        </form>
        <form
            v-else-if="page === '2fa'"
            class="flex flex-col bg-spacex-4 p-10 max-sm:w-80 w-[30rem] rounded-xl mt-auto"
            @submit.prevent="handleLogin"
        >
            <h1 class="mx-auto max-sm:!text-3xl">SpaceX - 2FA</h1>
            <p class="mt-4 text-center text-slate-200">
                Enter the 6-digit verification code from your authenticator app
            </p>
            <div class="mt-7 flex flex-col">
                <label class="font-semibold uppercase text-slate-300 text-sm">
                    OTP CODE
                </label>
                <input
                    v-model="credentials.otp"
                    type="text"
                    placeholder="Enter the 6-digit verification code"
                    minlength="6"
                    maxlength="6"
                    :class="`h-10 mt-1.5 py-2 px-3 bg-spacex-2 rounded-md outline-none focus:ring-2 focus:ring-spacex-primary placeholder-slate-300 ${
                        isLoggingIn && 'cursor-not-allowed'
                    }`"
                    :disabled="isLoggingIn"
                />
                <NuxtTurnstile
                    ref="turnstileRef"
                    v-model="credentials.cf_turnstile_token"
                    class="mt-6 mx-auto"
                    :options="{ theme: 'dark' }"
                />
                <button
                    :class="`mt-6 py-2 px-4 bg-spacex-primary rounded-lg  transition-all duration-300 flex items-center justify-center text-center ${
                        isLoggingIn && 'opacity-50 cursor-not-allowed'
                    }`"
                    :disabled="isLoggingIn"
                >
                    <span v-if="!isLoggingIn">Login</span>
                    <Spinner v-else :size="24" color="#fff" />
                </button>
            </div>
        </form>
        <Footer />
    </div>
</template>

<script setup lang="ts">
import { fire } from '@/util/toast';
import authEmitter from '@/util/emitters/auth';

const turnstileRef = ref<any>();
const isLoggingIn = ref(false);
const page = ref<'login' | '2fa'>('login');

const credentials = reactive({
    username: '',
    password: '',
    cf_turnstile_token: '',
    otp: '',
});

const router = useRouter();
const route = useRoute();

const handleLogin = async () => {
    isLoggingIn.value = true;

    const json = await useAPI('/auth/login', {
        method: 'POST',
        body: credentials,
    });

    if (json?.error) {
        turnstileRef.value?.reset();
        isLoggingIn.value = false;

        if (json.code === 'invalid_otp' && page.value === 'login') {
            page.value = '2fa';
        } else {
            fire(json.error, {
                type: 'error',
            });
        }
    } else {
        useCookie('token', {
            expires: new Date(Date.now() + 31556952000),
            sameSite: 'strict',
            path: '/',
        }).value = json.jwt;

        authEmitter.emit('login');

        await router.push((route.query.redirect_to as string) || '/dashboard');

        fire('You has been logged in successfully!', {
            type: 'success',
        });
    }
};

watch(
    () => credentials.otp,
    (otp) => {
        if (otp.length === 6) {
            handleLogin();
        }
    },
);

useHead({
    title: 'Login',
    meta: [
        {
            name: 'og:title',
            content: 'Login | SpaceX',
        },
        {
            name: 'theme-color',
            content: '#5e58f9',
        },
    ],
});
</script>
