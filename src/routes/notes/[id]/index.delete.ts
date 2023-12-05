import type { FastifyReply, FastifyRequest } from 'fastify';
import { getIp } from '../../../util/get-ip';
import { getClient } from '../../../util/database';
import { dispatchEvent } from '../../../util/wss';
import { getEntry, createEntry, deleteEntry } from '../../../util/cache';
import type { Note } from '../../../types';

export const middlewares = ['auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const id = req.params['id'];
    const note = getEntry<Note>('notes', id);

    if (!note) {
        return reply.status(404).send({
            code: 'note_not_found',
            error: 'Note not found',
        });
    }

    const client = getClient();

    await client.query('DELETE FROM notes WHERE id = $1', [id]);

    const log = {
        ip: getIp(req),
        action: 'delete_note',
        message: `Deleted note ${note.title}`,
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    deleteEntry('notes', id);
    createEntry('logs', log.date.toString(), log);

    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('DELETE_NOTE', { id });

    return reply.status(204).send();
};
