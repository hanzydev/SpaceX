export type Awaitable<T> = T | Promise<T>;

export interface PCInfo {
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

export interface Upload {
    id: string;
    size: {
        raw: number;
        formatted: string;
    };
    type: string;
    date: number;
    views: { ip: string; date: number }[];
    private: boolean;
    deleteAfterViews: number;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    date: number;
}

export interface Log {
    ip: string;
    action: string;
    message: string;
    date: number;
}

export interface Code {
    id: string;
    title: string;
    content: string;
    language: string;
    date: number;
    views: { ip: string; date: number }[];
    private: boolean;
    deleteAfterViews: number;
}

export interface ShortenedURL {
    id: string;
    url: string;
    date: number;
    views: { ip: string; date: number }[];
    private: boolean;
    deleteAfterViews: number;
}

export interface Folder {
    id: string;
    name: string;
    date: number;
    uploads: string[];
}

export interface Backup {
    id: string;
    size: {
        raw: number;
        formatted: string;
    };
    date: number;
}
