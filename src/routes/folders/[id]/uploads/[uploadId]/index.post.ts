import { getIp } from '@util/get-ip';
import { getClient } from '@util/database';
import { dispatchEvent } from '@wss';
import { getEntry, createEntry } from '@util/cache';

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

    if (folder.uploads.includes(uploadId)) {
        return reply.status(400).send({
            code: 'upload_already_in_folder',
            error: 'Upload already in folder',
        });
    }

    const client = getClient();

    await client.query('UPDATE folders SET uploads = $1 WHERE id = $2', [
        JSON.stringify([...folder.uploads, uploadId]),
        folderId,
    ]);

    const log = {
        ip: getIp(req),
        action: 'add_upload_to_folder',
        message: `Added upload ${uploadId} to folder ${folder.name}`,
        date: Date.now(),
    };

    await client.query('INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)', [
        log.ip,
        log.action,
        log.message,
        log.date,
    ]);

    createEntry('folders', folderId, { ...folder, uploads: [...folder.uploads, uploadId] });
    createEntry('logs', log.date.toString(), log);
    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('ADD_UPLOAD_TO_FOLDER', { folderId, uploadId });

    return reply.status(204).send();
};
