import { createEntry } from '@util/cache';
import { getClient } from '@util/database';
import { getIp } from '@util/get-ip';
import { randomString } from '@util/random-string';
import { dispatchEvent } from '@wss';

export const middlewares = ['only-json', 'auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const {
        title,
        content,
        language,
        private: isPrivate = false,
        deleteAfterViews = 0,
    } = req.body as Record<string, any>;

    if (!z.string().min(1).max(32).safeParse(title).success) {
        return reply.status(400).send({
            code: 'invalid_title',
            error: 'Invalid title',
        });
    }

    if (!z.string().min(1).max(100000).safeParse(content).success) {
        return reply.status(400).send({
            code: 'invalid_content',
            error: 'Invalid content',
        });
    }

    if (!z.string().min(1).max(30).safeParse(language).success) {
        return reply.status(400).send({
            code: 'invalid_language',
            error: 'Invalid language',
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

    const code = {
        id,
        title,
        content,
        language,
        date: Date.now(),
        views: { total: 0, today: 0 },
        private: isPrivate,
        deleteAfterViews,
    };

    await client.query(
        'INSERT INTO codes (id, title, content, date, language, views, private, delete_after_views) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [id, title, content, code.date, language, '[]', isPrivate, deleteAfterViews],
    );

    const log = {
        ip: getIp(req),
        action: 'create_code',
        message: `Created code ${title}`,
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    createEntry('codes', id, { ...code, views: [] });
    createEntry('logs', log.date.toString(), log);
    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('CREATE_CODE', code);

    return reply.status(200).send(code);
};
