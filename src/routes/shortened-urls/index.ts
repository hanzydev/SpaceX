import type { FastifyReply, FastifyRequest } from 'fastify';
import { getEntries } from '../../util/cache';
import type { ShortenedURL } from '../../types';

export const middlewares = ['auth'];

export default async (_: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send(
        getEntries<ShortenedURL>('shortened-urls')
            .sort((a, b) => b.date - a.date)
            .map((shortenedURL) => ({
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
            })),
    );
};
