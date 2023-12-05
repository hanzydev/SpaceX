import { getIp } from '@util/get-ip';
import { getClient } from '@util/database';
import { dispatchEvent } from '@wss';
import { getEntry, createEntry, deleteEntry } from '@util/cache';

export const middlewares = ['auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const id = req.params['id'];
    const folder = getEntry<Folder>('folders', id);

    if (!folder) {
        return reply.status(404).send({
            code: 'folder_not_found',
            error: 'Folder not found',
        });
    }

    const client = getClient();

    await client.query('DELETE FROM folders WHERE id = $1', [id]);

    const log = {
        ip: getIp(req),
        action: 'delete_folder',
        message: `Deleted folder ${folder.name}`,
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    deleteEntry('folders', id);
    createEntry('logs', log.date.toString(), log);
    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('DELETE_FOLDER', { id });

    return reply.status(204).send();
};
