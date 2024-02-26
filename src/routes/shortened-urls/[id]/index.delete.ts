import { createEntry, deleteEntry, getEntry } from '@util/cache';
import { getClient } from '@util/database';
import { getIp } from '@util/get-ip';
import { dispatchEvent } from '@wss';

export const middlewares = ['auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const id = req.params['id'];
    const shortenedURL = getEntry<ShortenedURL>('shortened-urls', id);

    if (!shortenedURL) {
        return reply.status(404).send({
            code: 'shortened_url_not_found',
            error: 'Shortened URL not found',
        });
    }

    const client = getClient();

    await client.query('DELETE FROM shortened_urls WHERE id = $1', [id]);

    const log = {
        ip: getIp(req),
        action: 'delete_shortened_url',
        message: `Deleted shortened url ${id}`,
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    deleteEntry('shortened-urls', id);
    createEntry('logs', log.date.toString(), log);

    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('DELETE_SHORTENED_URL', { id });

    return reply.status(204).send();
};
