import { getIp } from '@util/get-ip';
import { getClient } from '@util/database';
import { dispatchEvent } from '@wss';
import { getEntry, createEntry, deleteEntry, getEntries } from '@util/cache';

export const middlewares = ['auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const id = req.params['id'];
    const upload = getEntry<Upload>('uploads', id);

    if (!upload) {
        return reply.status(404).send({
            code: 'upload_not_found',
            error: 'Upload not found',
        });
    }

    const client = getClient();

    unlinkSync(`./files/uploads/${id}`);

    await client.query('DELETE FROM uploads WHERE id = $1', [id]);

    const log = {
        ip: getIp(req),
        action: 'delete_upload',
        message: `Deleted upload ${id}`,
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    deleteEntry('uploads', id);
    createEntry('logs', log.date.toString(), log);
    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('DELETE_UPLOAD', { id });

    const folders = getEntries<Folder>('folders').filter((folder) => folder.uploads.includes(id));

    if (folders.length) {
        for await (const folder of folders) {
            const uploads = folder.uploads;

            uploads.splice(uploads.indexOf(id), 1);

            await client.query('UPDATE folders SET uploads = $1 WHERE id = $2', [
                JSON.stringify(uploads),
                folder.id,
            ]);

            createEntry('folders', folder.id, { ...folder, uploads });
            dispatchEvent('REMOVE_UPLOAD_FROM_FOLDER', {
                folderId: folder.id,
                uploadId: id,
            });
        }
    }

    return reply.status(204).send();
};
