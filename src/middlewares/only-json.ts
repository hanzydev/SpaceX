import type { FastifyReply, FastifyRequest } from 'fastify';

export default async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.headers['content-type']?.startsWith('application/json')) {
        return reply.status(400).send({
            code: 'invalid_content_type',
            error: 'Content type must be application/json',
        });
    }

    return true;
};
