import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { getIp } from '../../util/get-ip';
import { getClient } from '../../util/database';
import { dispatchEvent } from '../../util/wss';
import { createEntry } from '../../util/cache';
import { randomString } from '../../util/random-string';

export const middlewares = ['only-json', 'auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const {
        url,
        private: isPrivate = false,
        deleteAfterViews = 0,
    } = req.body as Record<string, any>;

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
    const id = randomString(8);

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
