import type { FastifyReply, FastifyRequest } from 'fastify';
import { getEntries } from '../../util/cache';
import type { Backup } from '../../types';

export const path = '/backups';
export const method = 'get';
export const middlewares = ['auth'];

export default async (_: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send(getEntries<Backup>('backups').sort((a, b) => b.date - a.date));
};
