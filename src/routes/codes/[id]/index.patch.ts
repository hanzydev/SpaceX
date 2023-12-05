import { getIp } from '@util/get-ip';
import { getClient } from '@util/database';
import { dispatchEvent } from '@wss';
import { getEntry, createEntry, deleteEntry } from '@util/cache';

export const middlewares = ['only-json', 'auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const id = req.params['id'];
    const code = getEntry<Code>('codes', id);

    if (!code) {
        return reply.status(404).send({
            code: 'code_not_found',
            error: 'Code not found',
        });
    }

    const {
        title = code.title,
        content = code.content,
        private: isPrivate = code.private,
        deleteAfterViews = code.deleteAfterViews,
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

    const client = getClient();

    await client.query(
        'UPDATE codes SET title = $1, content = $2, private = $3, delete_after_views = $4 WHERE id = $5',
        [title, content, isPrivate, deleteAfterViews, id],
    );

    let logMessage = '';

    if (code.title !== title && code.content !== content) {
        logMessage = `Updated code ${code.title} to ${title} and updated content`;
    } else if (code.title !== title) {
        logMessage = `Updated code ${code.title} to ${title}`;
    } else if (code.content !== content) {
        logMessage = `Updated content of code ${code.title}`;
    } else {
        logMessage = `Updated code ${code.title}`;
    }

    const log = {
        ip: getIp(req),
        action: 'update_code',
        message: logMessage,
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    deleteEntry('codes', id);
    createEntry('codes', id, {
        ...code,
        title,
        content,
        private: isPrivate,
        deleteAfterViews,
    });
    createEntry('logs', log.date.toString(), log);
    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('UPDATE_CODE', { id, title, content, private: isPrivate, deleteAfterViews });

    return reply.status(200).send({
        ...code,
        title,
        content,
        private: isPrivate,
        deleteAfterViews,
    });
};
