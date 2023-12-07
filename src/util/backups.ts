import { basename } from 'node:path';
import { filesize } from 'filesize';
import { walk } from './walk';

export const getBackups = (): Backup[] => {
    const backups: Backup[] = [];

    for (const file of walk('./files/backups')) {
        const stat = statSync(file);

        backups.push({
            id: basename(file, '.tgz'),
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
    if (!existsSync(`./files/backups/${id}.tgz`)) {
        return null;
    }

    const stat = statSync(`./files/backups/${id}.tgz`);

    return {
        id: basename(id, '.tgz'),
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
