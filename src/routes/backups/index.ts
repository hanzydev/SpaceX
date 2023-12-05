import { getEntries } from '@util/cache';

export const path = '/backups';
export const method = 'get';
export const middlewares = ['auth'];

export default (_: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send(getEntries<Backup>('backups').sort((a, b) => b.date - a.date));
};
