import { getIp } from '@util/get-ip';
import { getClient } from '@util/database';
import { dispatchEvent } from '@wss';
import { getEntry, createEntry } from '@util/cache';
import { randomString } from '@util/random-string';

export const middlewares = ['only-json', 'auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    let {
        id,
        // eslint-disable-next-line prefer-const
        url,
        // eslint-disable-next-line prefer-const
        private: isPrivate = false,
        // eslint-disable-next-line prefer-const
        deleteAfterViews = 0,
    } = req.body as Record<string, any>;

    console.log(id);

    if (
        typeof id === 'string' &&
        id.length &&
        !z
            .string()
            .min(1)
            .max(128)
            .regex(/^[a-zA-Z0-9-_]+$/)
            .safeParse(id).success
    ) {
        return reply.status(400).send({
            code: 'invalid_id',
            error: 'Invalid id',
        });
    }

    if (!(typeof id === 'string' && id.length)) {
        id = randomString(8);
    }

    if (getEntry('shortened-urls', id)) {
        return reply.status(400).send({
            code: 'id_already_exists',
            error: 'Id already exists',
        });
    }

    if (!z.string().url().safeParse(url).success) {
        return reply.status(400).send({
            code: 'invalid_url',
            error: 'Invalid URL',
        });
    }

    if (!z.number().min(0).max(100000).safeParse(deleteAfterViews).success) {
        return reply.status(400).send({
            code: 'invalid_delete_after_views',
            error: 'Invalid delete after views',
        });
    }

    const client = getClient();

    const shortenedURL = {
        id,
        url,
        date: Date.now(),
        views: { total: 0, today: 0 },
        private: isPrivate,
        deleteAfterViews,
    };

    await client.query(
        'INSERT INTO shortened_urls (id, url, date, views, private, delete_after_views) VALUES ($1, $2, $3, $4, $5, $6)',
        [id, url, shortenedURL.date, '[]', isPrivate, deleteAfterViews],
    );

    const log = {
        ip: getIp(req),
        action: 'shorten_url',
        message: `Shortened url ${id}`,
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    createEntry('shortened-urls', id, { ...shortenedURL, views: [] });
    createEntry('logs', log.date.toString(), log);
    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('CREATE_SHORTENED_URL', shortenedURL);

    return reply.status(200).send({
        ...shortenedURL,
        shortenedURL: `${process.env.SITE_URL}/link/${shortenedURL.id}`,
    });
};
