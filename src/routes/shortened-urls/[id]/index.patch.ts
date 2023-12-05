import { getIp } from '@util/get-ip';
import { getClient } from '@util/database';
import { dispatchEvent } from '@wss';
import { getEntry, createEntry, deleteEntry } from '@util/cache';

export const middlewares = ['only-json', 'auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const id = req.params['id'];
    const shortenedURL = getEntry<ShortenedURL>('shortened-urls', id);

    if (!shortenedURL) {
        return reply.status(404).send({
            code: 'shortened_url_not_found',
            error: 'Shortened URL not found',
        });
    }

    const {
        id: newId = shortenedURL.id,
        private: isPrivate = shortenedURL.private,
        deleteAfterViews = shortenedURL.deleteAfterViews,
    } = req.body as Record<string, any>;

    if (
        !z
            .string()
            .min(1)
            .max(64)
            .regex(/^[a-zA-Z0-9-_]+$/)
            .safeParse(newId).success
    ) {
        return reply.status(400).send({
            code: 'invalid_id',
            error: 'Invalid id',
        });
    }

    if (!z.boolean().safeParse(isPrivate).success) {
        return reply.status(400).send({
            code: 'invalid_private',
            error: 'Invalid private',
        });
    }

    if (!z.number().min(0).max(100000).safeParse(deleteAfterViews).success) {
        return reply.status(400).send({
            code: 'invalid_delete_after_views',
            error: 'Invalid delete after views',
        });
    }

    if (newId !== shortenedURL.id) {
        const shortenedURLExists = getEntry('shortened-urls', newId);

        if (shortenedURLExists) {
            return reply.status(400).send({
                code: 'id_already_taken',
                error: 'Id already taken',
            });
        }
    }

    const client = getClient();

    await client.query(
        'UPDATE shortened_urls SET id = $1, private = $2, delete_after_views = $3 WHERE id = $4',
        [newId, isPrivate, deleteAfterViews, id],
    );

    let logMessage = '';

    if (newId !== shortenedURL.id) {
        logMessage = `Updated shortened url ${id} to ${newId}`;
    } else {
        logMessage = `Updated shortened url ${id}`;
    }

    const log = {
        ip: getIp(req),
        action: 'update_shortened_url',
        message: logMessage,
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    deleteEntry('shortened-urls', id);
    createEntry('shortened-urls', newId, {
        ...shortenedURL,
        id: newId,
        private: isPrivate,
        deleteAfterViews,
    });
    createEntry('logs', log.date.toString(), log);
    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('UPDATE_SHORTENED_URL', { id, newId, private: isPrivate, deleteAfterViews });

    return reply.status(200).send({
        ...shortenedURL,
        id: newId,
        private: isPrivate,
        deleteAfterViews,
    });
};
