import { destr } from 'destr';
import { getClient } from './database';
import { createCache } from './cache';
import { getBackups } from './backups';
import { getUploads } from './uploads';
import * as logger from './logger';

export const prepareDirs = () => {
    logger.info('Preparing directories');

    const dirs = ['files', 'files/uploads', 'files/backups', 'files/tmp'];

    for (const dir of dirs) {
        if (!existsSync(dir)) {
            mkdirSync(dir);
        }
    }
};

export const prepareCache = async () => {
    logger.info('Preparing cache');

    const client = getClient();

    const uploads: Upload[] = await client.query('SELECT * FROM uploads').then((result) =>
        result.rows.map((upload: any) => ({
            id: upload.id,
            size: destr(upload.size),
            type: upload.type,
            date: Number(upload.date),
            views: destr(upload.views),
            private: upload.private,
            deleteAfterViews: upload.delete_after_views,
        })),
    );

    const notes: Note[] = await client
        .query('SELECT * FROM notes')
        .then((result) => result.rows.map((note: any) => ({ ...note, date: Number(note.date) })));

    const logs: Log[] = await client
        .query('SELECT * FROM logs')
        .then((result) => result.rows.map((log: any) => ({ ...log, date: Number(log.date) })));

    const codes: Code[] = await client.query('SELECT * FROM codes').then((result) =>
        result.rows.map((code: any) => ({
            id: code.id,
            title: code.title,
            content: code.content,
            language: code.language,
            date: Number(code.date),
            views: destr(code.views),
            private: code.private,
            deleteAfterViews: code.delete_after_views,
        })),
    );

    const shortenedURLs: ShortenedURL[] = await client
        .query('SELECT * FROM shortened_urls')
        .then((result) =>
            result.rows.map((shortenedURL: any) => ({
                id: shortenedURL.id,
                url: shortenedURL.url,
                date: Number(shortenedURL.date),
                views: destr(shortenedURL.views),
                private: shortenedURL.private,
                deleteAfterViews: shortenedURL.delete_after_views,
            })),
        );

    const folders: Folder[] = await client.query('SELECT * FROM folders').then((result) =>
        result.rows.map((folder: any) => ({
            ...folder,
            date: Number(folder.date),
            uploads: destr(folder.uploads),
        })),
    );

    const backups = getBackups();

    const caches = [
        { data: uploads, cache: createCache<Upload>('uploads') },
        { data: notes, cache: createCache<Note>('notes') },
        { data: logs, cache: createCache<Log>('logs') },
        { data: codes, cache: createCache<Code>('codes') },
        { data: shortenedURLs, cache: createCache<ShortenedURL>('shortened-urls') },
        { data: folders, cache: createCache<Folder>('folders') },
        { data: backups, cache: createCache<string>('backups') },
    ];

    for (const cache of caches) {
        for (const data of cache.data) {
            cache.cache.set('id' in data ? data.id : data.date.toString(), data as never);
        }
    }

    createCache('other').set(
        'embed-config',
        destr(readFileSync('./files/embed-config.json', { encoding: 'utf-8' })),
    );
    logger.info(`Added ${caches.reduce((a, b) => a + b.data.length, 0) + 1} entries to cache`);
};

export const prepareUploads = async () => {
    logger.info('Preparing uploads');

    const client = getClient();
    const uploads = await getUploads();

    await client.query('DELETE FROM uploads');

    for (const upload of uploads) {
        await client.query(
            `INSERT INTO uploads (id, size, type, date, views, private, delete_after_views) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                upload.id,
                JSON.stringify(upload.size),
                upload.type,
                upload.date,
                JSON.stringify(upload.views),
                upload.private,
                upload.deleteAfterViews,
            ],
        );
    }
};
