import { readFileSync, writeFileSync } from 'fs';
import { defineConfig } from 'tsup';
import { createUnimport, type InlinePreset } from 'unimport';
import AutoImport from 'unplugin-auto-import/rollup';

const imports: InlinePreset[] = [
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
];

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
        AutoImport({
            include: [/\.ts$/],
            imports,
            dts: 'auto-imports.d.ts',
            injectAtEnd: true,
            eslintrc: {
                enabled: true,
                filepath: '.eslintrc-auto-import.json',
                globalsPropValue: true,
            },
        }),
    ],
    onSuccess: async () => {
        const { walk } = await import('@util/walk');

        const { injectImports } = createUnimport({
            imports: imports.reduce((acc, { from, imports, ...other }) => {
                imports.forEach((i) => acc.push({ from, name: i, ...other }));
                return acc;
            }, []),
        });

        for (const file of walk('./dist')) {
            const content = readFileSync(file, 'utf-8');
            const newContent = (await injectImports(content)).code;

            writeFileSync(file, newContent);
        }
    },
});
