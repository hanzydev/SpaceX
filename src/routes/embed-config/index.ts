import type { FastifyReply, FastifyRequest } from 'fastify';
import { getEntry } from '../../util/cache';

export default async (_: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send(getEntry('other', 'embed-config'));
};
