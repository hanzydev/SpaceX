<template>
    <div
        ref="sidebarOverlayRef"
        class="fixed inset-0 bg-[rgba(0,0,0,0.2)] z-20 backdrop-blur-sm justify-center items-center h-screen hidden lg:!hidden"
    />
    <nav
        id="sidebar"
        ref="sidebarRef"
        class="max-lg:mt-5 fixed z-30 flex max-lg:hidden flex-col bg-spacex-3 py-4 w-64 h-screen overflow-y-auto"
    >
        <div class="flex flex-col h-full gap-2">
            <div
                v-for="(item, index) in items"
                :key="index"
                class="flex flex-col gap-2"
            >
                <p class="mx-6 mt-3 text-slate-400 text-sm font-semibold">
                    {{ item.name }}
                </p>
                <NuxtLink
                    v-for="(child, index2) in item.children"
                    :key="index2"
                    :to="child.to"
                    class="flex items-center gap-3 px-3 py-2 mx-3 transition-colors font-medium text-base hover:bg-spacex-2 rounded-xl"
                >
                    <Icon :name="child.icon" />
                    {{ child.name }}
                </NuxtLink>
            </div>
            <div class="lg:hidden pb-[4.5rem]" />
        </div>
    </nav>
</template>

<script setup lang="ts">
import gsap from 'gsap';
import { useSidebarStore } from '@/store';

const router = useRouter();
const store = useSidebarStore();

const items = [
    {
        name: 'GENERAL',
        children: [
            {
                name: 'Home',
                icon: 'home',
                to: '/dashboard',
            },
        ],
    },
    {
        name: 'UPLOADS',
        children: [
            {
                name: 'Uploads',
                icon: 'archive',
                to: '/dashboard/uploads',
            },
            {
                name: 'Upload Files',
                icon: 'file-plus',
                to: '/dashboard/uploads/upload-files',
            },
        ],
    },
    {
        name: 'FOLDERS',
        children: [
            {
                name: 'Folders',
                icon: 'folder',
                to: '/dashboard/folders',
            },
            {
                name: 'Create',
                icon: 'folder-plus',
                to: '/dashboard/folders/create',
            },
        ],
    },
    {
        name: 'NOTES',
        children: [
            {
                name: 'Notes',
                icon: 'bookmark',
                to: '/dashboard/notes',
            },
            {
                name: 'Create',
                icon: 'plus',
                to: '/dashboard/notes/create',
            },
        ],
    },
    {
        name: 'CODES',
        children: [
            {
                name: 'Codes',
                icon: 'dev',
                to: '/dashboard/codes',
            },
            {
                name: 'Share',
                icon: 'share',
                to: '/dashboard/codes/share',
            },
        ],
    },
    {
        name: 'SHORTENED URLS',
        children: [
            {
                name: 'URLs',
                icon: 'link',
                to: '/dashboard/shortened-urls',
            },
            {
                name: 'Shorten',
                icon: 'shortcut',
                to: '/dashboard/shortened-urls/shorten',
            },
        ],
    },
];

const sidebarRef = ref<HTMLDivElement>();
const sidebarOverlayRef = ref<HTMLDivElement>();

const openSidebar = async (overlay = true, updateState = true) => {
    if (updateState) {
        store.setOpened(true);
    }

    if (overlay) {
        await gsap.fromTo(
            sidebarOverlayRef.value!,
            {
                opacity: 0,
            },
            {
                opacity: 1,
                duration: 0.3,
                display: 'flex',
            },
        );

        document.body.classList.add('max-lg:!overflow-hidden');
    }

    await gsap.set(sidebarRef.value!, {
        display: 'flex',
        x: '-100%',
    });

    await gsap.to(sidebarRef.value!, {
        x: 0,
        duration: 0.2,
    });
};

const closeSidebar = async () => {
    store.setOpened(false);

    await gsap.to(sidebarRef.value!, {
        x: '-100%',
        duration: 0.2,
        display: 'none',
    });

    await gsap.to(sidebarOverlayRef.value!, {
        opacity: 0,
        duration: 0.3,
        display: 'none',
    });

    document.body.classList.remove('max-lg:!overflow-hidden');
};

const onClickOutside = (event: any) => {
    if (
        store.opened &&
        window.innerWidth <= 1024 &&
        !event.target.closest('#navbar') &&
        !event.target.closest('#sidebar') &&
        !event.target.closest('#sidebar-toggler')
    ) {
        closeSidebar();
    }
};

onMounted(() => {
    document.addEventListener('click', onClickOutside);

    const observer = new ResizeObserver(() => {
        if (
            !store.opened &&
            sidebarRef.value!.style.display === 'none' &&
            window.innerWidth > 1024
        ) {
            openSidebar(false, false);
        } else if (
            !store.opened &&
            sidebarRef.value!.style.display === 'flex' &&
            window.innerWidth <= 1024
        ) {
            closeSidebar();
        }
    });

    observer.observe(document.body);
});

watch(
    () => store.opened,
    (value) => {
        if (value) {
            openSidebar();
        } else {
            closeSidebar();
        }
    },
);

router.beforeEach(async (_, __, next) => {
    if (store.opened) {
        await closeSidebar();
    }

    next();
});
</script>
