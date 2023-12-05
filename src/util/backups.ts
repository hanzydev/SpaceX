import { statSync, existsSync } from 'node:fs';
import { basename } from 'node:path';
import { filesize } from 'filesize';
import { walk } from './walk';
import type { Backup } from '../types';

export const getBackups = (): Backup[] => {
    const backups: Backup[] = [];

    for (const file of walk('./files/backups')) {
        const stat = statSync(file);

        backups.push({
            id: basename(file, '.tar.gz'),
            size: {
                raw: stat.size,
                formatted: filesize(stat.size, {
                    base: 2,
                    standard: 'jedec',
                }) as string,
            },
            date: stat.mtimeMs,
        });
    }

    return backups.sort((a, b) => b.date - a.date);
};

export const getBackup = (id: string): Backup | null => {
    if (!existsSync(`./files/backups/${id}.tar.gz`)) {
        return null;
    }

    const stat = statSync(`./files/backups/${id}.tar.gz`);

    return {
        id: basename(id, '.tar.gz'),
        size: {
            raw: stat.size,
            formatted: filesize(stat.size, {
                base: 2,
                standard: 'jedec',
            }) as string,
        },
        date: stat.mtimeMs,
    };
};
