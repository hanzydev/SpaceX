import { createEntry, getEntry } from '@util/cache';
import { getClient } from '@util/database';
import { getIp } from '@util/get-ip';
import { dispatchEvent } from '@wss';

export const middlewares = ['only-json', 'auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const id = req.params['id'];
    const folder = getEntry<Folder>('folders', id);

    if (!folder) {
        return reply.status(404).send({
            code: 'folder_not_found',
            error: 'Folder not found',
        });
    }

    folder;

    const { uploads } = req.body as Record<string, any>;

    if (!z.array(z.string()).safeParse(uploads).success) {
        return reply.status(400).send({
            code: 'invalid_uploads',
            error: 'Invalid uploads',
        });
    }

    const filteredUploads = uploads.filter((upload: string) => getEntry('uploads', upload));
    const client = getClient();

    await client.query('UPDATE folders SET uploads = $1 WHERE id = $2', [
        JSON.stringify(filteredUploads),
        id,
    ]);

    const log = {
        ip: getIp(req),
        action: 'bulk_update_folder_uploads',
        message: `Bulk updated uploads for folder ${folder.name}`,
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    createEntry('folders', id, { ...folder, uploads: filteredUploads });
    createEntry('logs', log.date.toString(), log);
    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('BULK_UPDATE_FOLDER_UPLOADS', { id, uploads: filteredUploads });

    return reply.status(204).send();
};
