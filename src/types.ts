export interface Upload {
    id: string;
    size: {
        raw: number;
        formatted: string;
    };
    type: string;
    date: number;
    views: { total: number; today: number };
    private: boolean;
    deleteAfterViews: number;
}

export interface Backup {
    id: string;
    size: {
        raw: number;
        formatted: string;
    };
    date: number;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    date: number;
}

export interface ShortenedURL {
    id: string;
    url: string;
    date: number;
    views: { total: number; today: number };
    private: boolean;
    deleteAfterViews: number;
}

export interface Code {
    id: string;
    title: string;
    content: string;
    date: number;
    language: string;
    views: { total: number; today: number };
    private: boolean;
    deleteAfterViews: number;
}

export interface EmbedConfig {
    enabled: boolean;
    color: string;
    title: string;
    description: string;
    site_name: string;
}

export interface Log {
    ip: string;
    action: string;
    message: string;
    date: number;
}

export interface Folder {
    id: string;
    name: string;
    date: number;
    uploads: string[];
}

export interface Stats {
    totalUploads: number;
    todayUploads: number;
    storageUsed: number;
    views: { total: number; today: number };
    chart: {
        views: {
            labels: string[];
            data: number[];
        };
        types: {
            labels: string[];
            data: number[];
        };
    } | null;
}

export interface MonitorData {
    ram: {
        total: string;
        free: string;
        used: string;
        usage: number;
    };
    disk: {
        total: string;
        free: string;
        used: string;
        usage: number;
    };
    cpu: {
        name: string;
        speed: number;
        cores: number;
        usage: number;
    };
    network: {
        in: number;
        out: number;
    };
    os: {
        name: string;
        platform: string;
        release: string;
        arch: string;
    };
}

export type Omit<T, K extends [...(keyof T)[]]> = Pick<
    T,
    Exclude<keyof T, K[number]>
>;
