import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyUser } from '../util/verify-user';

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const token = req.query['token'] || req.headers['authorization'];

    if (!token || (token && !(await verifyUser(token)))) {
        return reply.status(401).send({
            code: 'unauthorized',
            error: 'Unauthorized',
        });
    }

    return true;
};
