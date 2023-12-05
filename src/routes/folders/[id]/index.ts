import type { FastifyReply, FastifyRequest } from 'fastify';
import { getEntry } from '../../../util/cache';
import type { Folder } from '../../../types';

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

    return reply.status(200).send(folder);
};
