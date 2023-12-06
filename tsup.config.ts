import { defineConfig } from 'tsup';
import AutoImport from 'unplugin-auto-import';

export default defineConfig({
    target: 'esnext',
    keepNames: true,
    entryPoints: ['./src/**/*.ts'],
    clean: true,
    format: 'esm',
    splitting: true,
    minify: false,
    config: 'tsconfig.json',
    plugins: [
        {
            name: 'auto-import',
            async buildStart() {
                await autoImport.buildStart();
            },
            async buildEnd() {
                await autoImport.buildEnd();
            },
            async renderChunk(code, { path }) {
                const transformed = await autoImport.transform(code, path);

                if (!transformed) {
                    return { code };
                }

                return { code: transformed.code };
            },
        },
    ],
});

const autoImport = AutoImport.raw(
    {
        include: [/\.ts$/],
        imports: [
            {
                from: 'node:fs',
                imports: [
                    'existsSync',
                    'readFileSync',
                    'writeFileSync',
                    'appendFileSync',
                    'renameSync',
                    'unlinkSync',
                    'statSync',
                    'readdirSync',
                    'mkdirSync',
                    'cpSync',
                    'rmSync',
                ],
            },
            {
                from: 'zod',
                imports: ['z'],
            },
            {
                from: 'fastify',
                imports: ['FastifyRequest', 'FastifyReply'],
                type: true,
            },
            {
                from: '@types',
                imports: [
                    'Awaitable',
                    'PCInfo',
                    'Upload',
                    'Note',
                    'Log',
                    'Code',
                    'ShortenedURL',
                    'Folder',
                    'Backup',
                ],
                type: true,
            },
        ],
        dts: 'src/auto-imports.d.ts',
        injectAtEnd: true,
        eslintrc: {
            enabled: true,
            filepath: '.eslintrc-auto-import.json',
            globalsPropValue: true,
        },
    },
    {
        framework: 'rollup',
    },
) as any;
