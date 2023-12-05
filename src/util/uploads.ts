import { statSync } from 'node:fs';
import { basename } from 'node:path';
import fileType from 'file-type';
import { destr } from 'destr';
import { filesize } from 'filesize';
import { getClient } from './database';
import { walk } from './walk';
import type { Upload } from '../types';

export const getUploads = async (): Promise<Upload[]> => {
    const client = getClient();
    const uploads: Upload[] = [];

    for await (const file of walk('./files/uploads')) {
        const upload = await client
            .query('SELECT * FROM uploads WHERE id = $1', [basename(file)])
            .then((res) => res.rows[0]);

        const mimeType = upload
            ? upload.type
            : (await fileType.fromFile(file))?.mime ?? 'application/octet-stream';
        const stat = statSync(file);

        uploads.push({
            id: basename(file),
            size: upload
                ? destr(upload.size)
                : {
                      raw: stat.size,
                      formatted: filesize(stat.size, {
                          base: 2,
                          standard: 'jedec',
                      }) as string,
                  },
            type: mimeType,
            date: upload ? Number(upload.date) : stat.mtime?.getTime()!,
            views: upload ? destr(upload.views) : [],
            private: upload ? upload.private : false,
            deleteAfterViews: upload ? upload.delete_after_views : 0,
        });
    }

    return uploads.sort((a, b) => b.date - a.date);
};
