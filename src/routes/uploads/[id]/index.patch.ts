import { extname } from 'node:path';

import { createEntry, deleteEntry, getEntries, getEntry } from '@util/cache';
import { getClient } from '@util/database';
import { getIp } from '@util/get-ip';
import { dispatchEvent } from '@wss';

export const middlewares = ['only-json', 'auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const id = req.params['id'];
    const upload = getEntry<Upload>('uploads', id);

    if (!upload) {
        return reply.status(404).send({
            code: 'upload_not_found',
            error: 'Upload not found',
        });
    }

    const {
        id: newId = upload.id,
        private: isPrivate = upload.private,
        deleteAfterViews = upload.deleteAfterViews,
    } = req.body as Record<string, any>;

    if (
        !z
            .string()
            .min(1)
            .max(128)
            .regex(/^[a-zA-Z0-9-_]+$/)
            .safeParse(newId).success
    ) {
        return reply.status(400).send({
            code: 'invalid_id',
            error: 'Invalid id',
        });
    }

    if (!z.boolean().safeParse(isPrivate).success) {
        return reply.status(400).send({
            code: 'invalid_private',
            error: 'Invalid private',
        });
    }

    if (!z.number().min(0).max(100000).safeParse(deleteAfterViews).success) {
        return reply.status(400).send({
            code: 'invalid_delete_after_views',
            error: 'Invalid delete after views',
        });
    }

    const ext = extname(upload.id);
    const fullname = `${newId}${ext}`;

    if (fullname !== upload.id) {
        const uploadExists = getEntry('uploads', fullname);

        if (uploadExists) {
            return reply.status(400).send({
                code: 'id_already_taken',
                error: 'Id already taken',
            });
        }

        renameSync(`./files/uploads/${upload.id}`, `./files/uploads/${fullname}`);
    }

    const client = getClient();

    await client.query(
        'UPDATE uploads SET id = $1, private = $2, delete_after_views = $3 WHERE id = $4',
        [fullname, isPrivate, deleteAfterViews, id],
    );

    let logMessage = '';

    if (fullname !== upload.id) {
        logMessage = `Updated upload ${id} to ${fullname}`;
    } else {
        logMessage = `Updated upload ${id}`;
    }

    const log = {
        ip: getIp(req),
        action: 'update_upload',
        message: logMessage,
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    deleteEntry('uploads', id);
    createEntry('uploads', fullname, {
        ...upload,
        id: fullname,
        private: isPrivate,
        deleteAfterViews,
    });
    createEntry('logs', log.date.toString(), log);
    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('UPDATE_UPLOAD', { id, newId: fullname, private: isPrivate, deleteAfterViews });

    const folders = getEntries<Folder>('folders').filter((folder) => folder.uploads.includes(id));

    if (folders.length) {
        for await (const folder of folders) {
            const uploads = folder.uploads;

            uploads.splice(uploads.indexOf(id), 1, fullname);

            await client.query('UPDATE folders SET uploads = $1 WHERE id = $2', [
                JSON.stringify(uploads),
                folder.id,
            ]);

            createEntry('folders', folder.id, { ...folder, uploads });
            dispatchEvent('BULK_UPDATE_FOLDER_UPLOADS', { id: folder.id });
        }
    }

    return reply.status(200).send({
        ...upload,
        id: fullname,
        private: isPrivate,
        deleteAfterViews,
    });
};
