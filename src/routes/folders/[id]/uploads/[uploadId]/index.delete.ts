import type { FastifyReply, FastifyRequest } from 'fastify';
import { getIp } from '../../../../../util/get-ip';
import { getClient } from '../../../../../util/database';
import { dispatchEvent } from '../../../../../util/wss';
import { getEntry, createEntry } from '../../../../../util/cache';
import type { Folder, Upload } from '../../../../../types';

export const middlewares = ['auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const { id: folderId, uploadId } = req.params as Record<string, string>;
    const folder = getEntry<Folder>('folders', folderId);

    if (!folder) {
        return reply.status(404).send({
            code: 'folder_not_found',
            error: 'Folder not found',
        });
    }

    const upload = getEntry<Upload>('uploads', uploadId);

    if (!upload) {
        return reply.status(404).send({
            code: 'upload_not_found',
            error: 'Upload not found',
        });
    }

    if (!folder.uploads.includes(uploadId)) {
        return reply.status(400).send({
            code: 'upload_not_in_folder',
            error: 'Upload not in folder',
        });
    }

    const client = getClient();

    await client.query('UPDATE folders SET uploads = $1 WHERE id = $2', [
        JSON.stringify(folder.uploads.filter((u: string) => u !== uploadId)),
        folderId,
    ]);

    const log = {
        ip: getIp(req),
        action: 'remove_upload_from_folder',
        message: `Removed upload ${uploadId} from folder ${folder.name}`,
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    createEntry('folders', folderId, {
        ...folder,
        uploads: folder.uploads.filter((u: string) => u !== uploadId),
    });
    createEntry('logs', log.date.toString(), log);
    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('REMOVE_UPLOAD_FROM_FOLDER', { folderId, uploadId });

    return reply.status(204).send();
};
