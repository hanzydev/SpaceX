import { defineStore } from 'pinia';
import type {
    Upload,
    Note,
    Backup,
    Log,
    ShortenedURL,
    Code,
    Folder,
    EmbedConfig,
    Stats,
    MonitorData,
} from '@/types';

export interface UploadsStore {
    uploads: Upload[];
    uploadsLoaded: boolean;
}

export interface NotesStore {
    notes: Note[];
    notesLoaded: boolean;
}

export interface ShortenedURLsStore {
    shortenedURLs: ShortenedURL[];
    shortenedURLsLoaded: boolean;
}

export interface CodesStore {
    codes: Code[];
    codesLoaded: boolean;
}

export interface BackupsStore {
    backups: Backup[];
    backupsLoaded: boolean;
}

export interface StatsStore {
    stats: Stats;
    statsLoaded: boolean;
}

export interface FoldersStore {
    folders: Folder[];
    foldersLoaded: boolean;
}

export interface LogsStore {
    logs: Log[];
    logsLoaded: boolean;
}

export interface EmbedConfigStore {
    embedConfig: EmbedConfig | null;
}

export interface MonitorStore {
    data: MonitorData | null;
}

export interface UserStore {
    twoFaEnabled: boolean;
    username: string;
}

export interface SidebarStore {
    opened: boolean;
}

export const useStatsStore = defineStore('stats', {
    state: (): StatsStore => ({
        stats: {
            storageUsed: 0,
            todayUploads: 0,
            totalUploads: 0,
            views: { total: 0, today: 0 },
            chart: null,
        },
        statsLoaded: false,
    }),
    actions: {
        async fetchStats() {
            const json = await useAPI('/stats', {
                auth: true,
            });

            if (!json?.error) {
                this.stats = json;
                this.statsLoaded = true;
            }
        },
    },
});

export const useUploadsStore = defineStore('uploads', {
    state: (): UploadsStore => ({
        uploads: [],
        uploadsLoaded: false,
    }),
    actions: {
        async fetchUploads() {
            const json = await useAPI('/uploads', {
                auth: true,
            });

            if (!json?.error) {
                this.uploads = json;
                this.uploadsLoaded = true;
            }
        },
        deleteUpload(id: string) {
            return useAPI(`/uploads/${id}`, {
                method: 'DELETE',
                auth: true,
            });
        },
    },
});

export const useNotesStore = defineStore('notes', {
    state: (): NotesStore => ({
        notes: [],
        notesLoaded: false,
    }),
    actions: {
        async fetchNotes() {
            const json = await useAPI('/notes', {
                auth: true,
            });

            if (!json?.error) {
                this.notes = json;
                this.notesLoaded = true;
            }
        },
        deleteNote(id: string) {
            return useAPI(`/notes/${id}`, {
                method: 'DELETE',
                auth: true,
            });
        },
    },
});

export const useShortenedURLsStore = defineStore('shortenedURLs', {
    state: (): ShortenedURLsStore => ({
        shortenedURLs: [],
        shortenedURLsLoaded: false,
    }),
    actions: {
        async fetchShortenedURLs() {
            const json = await useAPI('/shortened-urls', {
                auth: true,
            });

            if (!json?.error) {
                this.shortenedURLs = json;
                this.shortenedURLsLoaded = true;
            }
        },
        deleteShortenedURL(id: string) {
            return useAPI(`/shortened-urls/${id}`, {
                method: 'DELETE',
                auth: true,
            });
        },
    },
});

export const useCodesStore = defineStore('codes', {
    state: (): CodesStore => ({
        codes: [],
        codesLoaded: false,
    }),
    actions: {
        async fetchCodes() {
            const json = await useAPI('/codes', {
                auth: true,
            });

            if (!json?.error) {
                this.codes = json;
                this.codesLoaded = true;
            }
        },
        deleteCode(id: string) {
            return useAPI(`/codes/${id}`, {
                method: 'DELETE',
                auth: true,
            });
        },
    },
});

export const useBackupsStore = defineStore('backups', {
    state: (): BackupsStore => ({
        backups: [],
        backupsLoaded: false,
    }),
    actions: {
        async fetchBackups() {
            const json = await useAPI('/backups', {
                auth: true,
            });

            if (!json?.error) {
                this.backups = json;
                this.backupsLoaded = true;
            }
        },
        deleteBackup(id: string) {
            return useAPI(`/backups/${id}`, {
                method: 'DELETE',
                auth: true,
            });
        },
        restoreFromBackup(id: string) {
            return useAPI(`/backups/${id}`, {
                method: 'PUT',
                auth: true,
            });
        },
    },
});

export const useFoldersStore = defineStore('folders', {
    state: (): FoldersStore => ({
        folders: [],
        foldersLoaded: false,
    }),
    actions: {
        async fetchFolders() {
            const json = await useAPI('/folders', {
                auth: true,
            });

            if (!json?.error) {
                this.folders = json;
                this.foldersLoaded = true;
            }
        },
        deleteFolder(id: string) {
            return useAPI(`/folders/${id}`, {
                method: 'DELETE',
                auth: true,
            });
        },
        removeUpload(folderId: string, uploadId: string) {
            return useAPI(`/folders/${folderId}/uploads/${uploadId}`, {
                method: 'DELETE',
                auth: true,
            });
        },
        async setFolderUploads(id: string, uploads: string[]) {
            const folder = this.folders.find((folder) => folder.id === id);

            if (folder) {
                folder.uploads = uploads;
            }
        },
    },
});

export const useLogsStore = defineStore('logs', {
    state: (): LogsStore => ({
        logs: [],
        logsLoaded: false,
    }),
    actions: {
        async fetchLogs() {
            const json = await useAPI('/logs', {
                auth: true,
            });

            if (!json?.error) {
                this.logs = json;
                this.logsLoaded = true;
            }
        },
    },
});

export const useEmbedConfigStore = defineStore('embedConfig', {
    state: (): EmbedConfigStore => ({
        embedConfig: null,
    }),
    actions: {
        async fetchEmbedConfig() {
            this.embedConfig = await useAPI('/embed-config');
        },
    },
});

export const useMonitorStore = defineStore('monitor', {
    state: (): MonitorStore => ({
        data: null,
    }),
    actions: {
        setData(data: MonitorData) {
            this.data = data;
        },
    },
});

export const useUserStore = defineStore('2fa', {
    state: (): UserStore => ({
        twoFaEnabled: false,
        username: '',
    }),
    actions: {
        set2FaEnabled(twoFaEnabled: boolean) {
            this.twoFaEnabled = twoFaEnabled;
        },
        setUsername(username: string) {
            this.username = username;
        },
    },
});

export const useSidebarStore = defineStore('sidebar', {
    state: (): SidebarStore => ({
        opened: false,
    }),
    actions: {
        setOpened(opened: boolean) {
            this.opened = opened;
        },
    },
});
