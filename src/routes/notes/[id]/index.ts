import type { FastifyReply, FastifyRequest } from 'fastify';
import { getEntry } from '../../../util/cache';
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

    return reply.status(200).send(note);
};
