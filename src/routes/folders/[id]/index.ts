import { getEntry } from '@util/cache';

export const middlewares = ['auth'];

export default (req: FastifyRequest, reply: FastifyReply) => {
    const id = req.params['id'];
    const folder = getEntry<Folder>('folders', id);

    if (!folder) {
        return reply.status(404).send({
            code: 'folder_not_found',
            error: 'Folder not found',
        });
    }

    return reply.status(200).send(folder);
};
