import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ParsedPath } from 'node:path';
import type { FastifyRequest, FastifyReply, HTTPMethods } from 'fastify';
import type { Awaitable } from '../types';

interface RawRoute {
    name: string;
    path: string;
    rel: string;
    filePath: string;
}

interface Route {
    path: string;
    method: HTTPMethods;
    regex: RegExp;
    middlewares: string[];
    config: Record<string, any>;
    fn: (req: FastifyRequest, reply: FastifyReply) => Awaitable<any>;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const mergePaths = (...paths: string[]) =>
    `/${paths
        .map((path) => path.replace(/^\/|\/$/g, ''))
        .filter((path) => path !== '')
        .join('/')}`;

const regBackets = /\[([^}]*)\]/g;

const transformBrackets = (value: string) =>
    regBackets.test(value) ? value.replace(regBackets, (_, s) => `:${s}`) : value;

const convertParamSyntax = (path: string) => {
    const subpaths = [];

    for (const subpath of path.split('/')) {
        subpaths.push(transformBrackets(subpath));
    }

    return mergePaths(...subpaths);
};

const convertCatchAllSyntax = (url: string) => url.replace(/:\.\.\.\w+/g, '*');

const buildRoutePathRaw = (parsedFile: ParsedPath) => {
    const directory = parsedFile.dir === parsedFile.root ? '' : parsedFile.dir;
    const name = parsedFile.name.startsWith('index')
        ? parsedFile.name.replace('index', '')
        : `/${parsedFile.name}`;

    return `${directory}${name}`;
};

const buildRoutePath = (raw: string) => {
    const paramURL = convertParamSyntax(raw);

    let path = convertCatchAllSyntax(paramURL);
    let method = 'get';

    for (const m of ['.GET', '.POST', '.PUT', '.DELETE', '.PATCH']) {
        if (raw.toLowerCase().endsWith(m.toLowerCase())) {
            method = m.toLowerCase().slice(1);
            path = path.slice(0, path.length - m.length);
            break;
        }
    }

    return {
        path,
        method,
        regex: new RegExp(`^${path.replace(/\/:[^/]+/g, '/[^/]+')}$`),
    };
};

const walkRoutes = async (
    directory = path.join(__dirname, 'routes'),
    tree: string[] = [],
): Promise<RawRoute[]> => {
    const readDirPriority = readdirSync(directory);
    const results = [];

    readDirPriority.sort((a, b) => {
        if (a.startsWith('_') && !b.startsWith('_')) {
            return -1;
        } else if (!a.startsWith('_') && b.startsWith('_')) {
            return 1;
        }

        return a.localeCompare(b);
    });

    for (const fileName of readDirPriority) {
        const filePath = path.join(directory, fileName);
        const fileStats = statSync(filePath);

        if (fileStats.isDirectory()) {
            results.push(...(await walkRoutes(filePath, [...tree, fileName])));
        } else {
            results.push({
                name: fileName,
                path: directory,
                rel: mergePaths(...tree, fileName),
                filePath,
            });
        }
    }

    return results;
};

let _cache: Route[] = [];

export const generateRoutes = async (): Promise<Route[]> => {
    const files = await walkRoutes();
    const routes = [];

    for (const file of files) {
        const parsedFile = path.parse(file.rel);
        const packageURL = new URL(path.resolve(file.filePath), __dirname).pathname.replaceAll(
            '\\',
            '/',
        );

        const route = buildRoutePath(buildRoutePathRaw(parsedFile));
        const def = await import(packageURL);

        routes.push({
            ...route,
            middlewares: def.middlewares ?? [],
            config: def.config ?? {},
            fn: def.default,
        });
    }

    return (_cache = routes);
};

export const cache = () => _cache;
