import { getEntry } from '@util/cache';

export default (_: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send(getEntry('other', 'embed-config'));
};
