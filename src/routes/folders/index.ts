import { getEntries } from '@util/cache';

export const middlewares = ['auth'];

export default (_: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send(getEntries<Folder>('folders').sort((a, b) => b.date - a.date));
};
