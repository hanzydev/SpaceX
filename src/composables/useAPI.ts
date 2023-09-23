import { API_URL } from '@/constants';
import type { NitroFetchOptions } from 'nitropack';

interface ExtendedFetchOptions extends NitroFetchOptions<string> {
    auth?: boolean;
}

type FetchOptions = Exclude<
    Exclude<ExtendedFetchOptions, 'baseURL'>,
    'ignoreResponseError'
>;

export function useAPI<T = any>(
    route: `/${string}`,
    options: FetchOptions = { method: 'get' },
): Promise<T> {
    if (options.auth) {
        if (!options.headers) {
            options.headers = {};
        }

        (options.headers as any).Authorization = useCookie('token').value!;
    }

    return $fetch(route, {
        ...options,
        ignoreResponseError: true,
        baseURL: API_URL,
    });
}

export function useAsyncAPI<T = any>(
    route: `/${string}`,
    options: FetchOptions = { method: 'get' },
) {
    return useAsyncData<T>(() => useAPI(route, options));
}
