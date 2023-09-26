<template>
    <Teleport v-if="isDemonstrable" to="body">
        <div
            ref="containerRef"
            class="fixed inset-0 bg-[rgba(0,0,0,0.2)] z-[9999] backdrop-blur-sm justify-center items-center h-screen hidden"
        >
            <div
                ref="contentRef"
                class="bg-spacex-4 rounded-xl p-0 fixed w-[90%] max-w-[640px] max-h-[90%] overflow-auto opacity-100 translate-none transform-none ring-2 ring-spacex-primary hidden"
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
}>();

const containerRef = ref<HTMLDivElement>();
const contentRef = ref<HTMLDivElement>();
const isDemonstrable = ref(false);

const router = useRouter();

const openModal = async () => {
    isDemonstrable.value = true;
    document.body.classList.add('overflow-hidden');

    await nextTick();
    gsap.fromTo(
        containerRef.value!,
        {
            opacity: 0,
        },
        {
            opacity: 1,
            duration: 0.3,
            display: 'flex',
            onComplete: () => {
                gsap.fromTo(
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
            },
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
        onComplete: () => {
            gsap.to(containerRef.value!, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    isDemonstrable.value = false;
                },
            });
        },
    });
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
