import { createEntry, deleteEntry, getEntry } from '@util/cache';
import { getClient } from '@util/database';
import { getIp } from '@util/get-ip';
import { dispatchEvent } from '@wss';

import authMiddleware from '../../../middlewares/auth';

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const id = req.params['id'];
    const code = getEntry<Code>('codes', id);

    if (!code) {
        return reply.status(404).send({
            code: 'code_not_found',
            error: 'Code not found',
        });
    }

    if (code.private && (await authMiddleware(req, reply)) !== true) {
        return void 0;
    }

    if (req.query['log'] === 'true') {
        const client = getClient();
        const ip = getIp(req);

        code.views = [
            ...code.views,
            {
                ip,
                date: Date.now(),
            },
        ];

        await client.query('UPDATE codes SET views = $1 WHERE id = $2', [
            JSON.stringify(code.views),
            id,
        ]);

        const log = {
            ip,
            action: 'view_code',
            message: `Viewed code ${code.title}`,
            date: Date.now(),
        };

        await client.query(
            'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
            Object.values(log),
        );

        createEntry('logs', log.date.toString(), log);
        createEntry('codes', id, code);
        dispatchEvent('CREATE_LOG', log);

        if (code.deleteAfterViews && code.views.length >= code.deleteAfterViews) {
            await client.query('DELETE FROM codes WHERE id = $1', [id]);

            const log = {
                ip,
                action: 'delete_code',
                message: `Deleted code ${code.title} because it reached ${code.deleteAfterViews} views`,
                date: Date.now(),
            };

            await client.query(
                'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
                Object.values(log),
            );

            deleteEntry('codes', id);
            createEntry('logs', log.date.toString(), log);
            dispatchEvent('CREATE_LOG', log);
            dispatchEvent('DELETE_CODE', { id });
        }
    }

    return reply.status(200).send({
        ...code,
        views: {
            total: code.views.length,
            today: code.views.filter((view) => {
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
