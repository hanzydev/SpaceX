import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { Awaitable } from '../types';

interface Middleware {
    name: string;
    global: boolean;
    fn: (req: FastifyRequest, reply: FastifyReply) => Awaitable<boolean>;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let _cache: Middleware[] = [];

export const generateMiddlewares = async (): Promise<Middleware[]> => {
    const directory = path.resolve(__dirname, 'middlewares');
    const files = readdirSync(directory);
    const middlewares = [];

    for (const file of files) {
        const withoutExtension = path.basename(file, path.extname(file));
        const packageURL = new URL(path.join(directory, file), __dirname).pathname.replaceAll(
            '\\',
            '/',
        );

        const def = await import(packageURL);

        middlewares.push({
            name: withoutExtension,
            global: withoutExtension.toLowerCase().endsWith('.global'),
            fn: def.default,
        });
    }

    return (_cache = middlewares);
};

export const cache = () => _cache;
