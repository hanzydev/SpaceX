import type { FastifyReply, FastifyRequest } from 'fastify';

export default (_: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({ message: 'Welcome to SpaceX REST API' });
};
