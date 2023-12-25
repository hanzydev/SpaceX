<template>
    <Teleport v-if="isDemonstrable" to="body">
        <div
            ref="containerRef"
            class="fixed inset-0 z-[9999] hidden h-screen items-center justify-center bg-[rgba(0,0,0,0.2)] backdrop-blur-sm"
        >
            <div
                ref="contentRef"
                class="translate-none fixed hidden max-h-[90%] w-[90%] max-w-[640px] transform-none overflow-auto rounded-xl bg-spacex-4 p-0 opacity-100 ring-2 ring-spacex-primary"
            >
                <div class="w-full">
                    <slot />
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import gsap from 'gsap';

const { isOpen = false } = defineProps<{
    isOpen?: boolean;
}>();

const emit = defineEmits<{
    (event: 'close'): void;
    (event: 'closed'): void;
}>();

const containerRef = ref<HTMLDivElement>();
const contentRef = ref<HTMLDivElement>();
const isDemonstrable = ref(false);

const router = useRouter();

const openModal = async () => {
    isDemonstrable.value = true;
    document.body.classList.add('overflow-hidden');

    await nextTick();

    await gsap.fromTo(
        containerRef.value!,
        {
            opacity: 0,
        },
        {
            opacity: 1,
            duration: 0.3,
            display: 'flex',
        },
    );

    await gsap.fromTo(
        contentRef.value!,
        {
            opacity: 0,
            scale: 0.4,
        },
        {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            display: 'flex',
            ease: 'back.out(2)',
        },
    );
};

const closeModal = async () => {
    if (!contentRef.value || !containerRef.value) {
        return;
    }

    document.body.classList.remove('overflow-hidden');
    emit('close');

    await gsap.to(contentRef.value!, {
        opacity: 0,
        scale: 0.4,
        duration: 0.3,
        ease: 'back.in(2)',
    });

    await gsap.to(containerRef.value!, {
        opacity: 0,
        duration: 0.3,
    });

    isDemonstrable.value = false;

    await nextTick();
    emit('closed');
};

const onKeyDown = (event: KeyboardEvent) => {
    if (isOpen && event.key === 'Escape') {
        closeModal();
    }
};

const onClickOutside = (event: MouseEvent) => {
    if (isOpen && event.target === containerRef.value) {
        closeModal();
    }
};

onMounted(() => {
    if (isOpen) {
        openModal();
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('click', onClickOutside);
    document.body.classList.remove('overflow-hidden');
});

router.beforeEach(async (_, __, next) => {
    if (isOpen) {
        await closeModal();
    }

    next();
});

watch(
    () => isOpen,
    (value) => {
        if (value) {
            openModal();
        } else {
            closeModal();
        }
    },
);
</script>
