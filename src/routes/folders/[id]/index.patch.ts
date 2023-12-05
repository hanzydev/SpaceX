import { getIp } from '@util/get-ip';
import { getClient } from '@util/database';
import { dispatchEvent } from '@wss';
import { getEntry, createEntry } from '@util/cache';

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

    const { name } = req.body as Record<string, any>;

    if (!z.string().min(1).max(32).safeParse(name).success) {
        return reply.status(400).send({
            code: 'invalid_name',
            error: 'Invalid name',
        });
    }

    const client = getClient();

    await client.query('UPDATE folders SET name = $1 WHERE id = $2', [name, id]);

    const log = {
        ip: getIp(req),
        action: 'update_folder',
        message: `Updated folder ${folder.name} to ${name}`,
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    createEntry('folders', id, { ...folder, name });
    createEntry('logs', log.date.toString(), log);
    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('UPDATE_FOLDER', { id, name });

    return reply.status(200).send({ ...folder, name });
};
