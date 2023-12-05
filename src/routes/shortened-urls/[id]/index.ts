import type { FastifyReply, FastifyRequest } from 'fastify';
import { getIp } from '../../../util/get-ip';
import { getClient } from '../../../util/database';
import { dispatchEvent } from '../../../util/wss';
import { getEntry, createEntry, deleteEntry } from '../../../util/cache';
import authMiddleware from '../../../middlewares/auth';
import type { ShortenedURL } from '../../../types';

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const id = req.params['id'];
    const shortenedURL = getEntry<ShortenedURL>('shortened-urls', id);

    if (!shortenedURL) {
        return reply.status(404).send({
            code: 'shortened_url_not_found',
            error: 'Shortened URL not found',
        });
    }

    if (shortenedURL.private && (await authMiddleware(req, reply)) !== true) {
        return void 0;
    }

    if (req.query['log'] === 'true') {
        const client = getClient();
        const ip = getIp(req);

        shortenedURL.views = [
            ...shortenedURL.views,
            {
                ip,
                date: Date.now(),
            },
        ];

        await client.query('UPDATE shortened_urls SET views = $1 WHERE id = $2', [
            JSON.stringify(shortenedURL.views),
            id,
        ]);

        const log = {
            ip,
            action: 'view_url',
            message: `Viewed url ${id}`,
            date: Date.now(),
        };

        await client.query(
            'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
            Object.values(log),
        );

        createEntry('logs', log.date.toString(), log);
        createEntry('shortened-urls', id, shortenedURL);
        dispatchEvent('CREATE_LOG', log);

        if (
            shortenedURL.deleteAfterViews &&
            shortenedURL.views.length >= shortenedURL.deleteAfterViews
        ) {
            await client.query('DELETE FROM shortened_urls WHERE id = $1', [id]);

            const log = {
                ip,
                action: 'delete_shortened_url',
                message: `Deleted shortened url ${id} because it reached ${shortenedURL.deleteAfterViews} views`,
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
        }
    }

    return reply.status(200).send({
        ...shortenedURL,
        views: {
            total: shortenedURL.views.length,
            today: shortenedURL.views.filter((view) => {
                const date = new Date(view.date);
                const today = new Date();

                return (
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()
                );
            }).length,
        },
    });
};
