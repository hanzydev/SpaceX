const caches = new Map<string, Map<any, any>>();

export const createCache = <V>(name: string): Map<string, V> => {
    if (!caches.has(name)) {
        caches.set(name, new Map());
    }

    return caches.get(name)!;
};

export const deleteCache = (name: string) => {
    caches.delete(name);
};

export const getCaches = () => {
    return caches;
};

export const getEntries = <V>(name: string): V[] => {
    if (!caches.has(name)) {
        caches.set(name, new Map());
    }

    return Array.from(caches.get(name)!.values());
};

export const getKeys = (name: string): string[] => {
    if (!caches.has(name)) {
        caches.set(name, new Map());
    }

    return Array.from(caches.get(name)!.keys());
};

export const getEntry = <V>(name: string, key: string): V => {
    if (!caches.has(name)) {
        caches.set(name, new Map());
    }

    return caches.get(name)!.get(key);
};

export const createEntry = <V>(name: string, key: string, value: V) => {
    if (!caches.has(name)) {
        caches.set(name, new Map());
    }

    caches.get(name)!.set(key, value);
};

export const deleteEntry = (name: string, key: string) => {
    if (!caches.has(name)) {
        caches.set(name, new Map());
    }

    caches.get(name)!.delete(key);
};
