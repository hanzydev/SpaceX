import type { FastifyReply, FastifyRequest } from 'fastify';
import { getEntries } from '../../util/cache';
import type { Folder } from '../../types';

export const middlewares = ['auth'];

export default async (_: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send(getEntries<Folder>('folders').sort((a, b) => b.date - a.date));
};
