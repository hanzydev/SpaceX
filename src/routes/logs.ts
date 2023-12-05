import type { FastifyReply, FastifyRequest } from 'fastify';
import { getEntries } from '../util/cache';
import type { Log } from '../types';

export const middlewares = ['auth'];

export default (_: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send(getEntries<Log>('logs').sort((a, b) => b.date - a.date));
};
