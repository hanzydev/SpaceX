import send from '@fastify/send';
import { getEntry } from '@util/cache';

export const middlewares = ['auth'];

export default (req: FastifyRequest, reply: FastifyReply) => {
    const id = req.params['id'];

    if (!getEntry('backups', id)) {
        return reply.status(404).send({
            code: 'backup_not_found',
            error: 'Backup not found',
        });
    }

    return reply.send(send(req.raw, `${id}.tar.gz`, { root: './files/backups' }));
};
