import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { getIp } from '../../util/get-ip';
import { getClient } from '../../util/database';
import { dispatchEvent } from '../../util/wss';
import { createEntry } from '../../util/cache';
import { randomString } from '../../util/random-string';

export const middlewares = ['only-json', 'auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const { title, content } = req.body as Record<string, any>;

    if (!z.string().min(1).max(32).safeParse(title).success) {
        return reply.status(400).send({
            code: 'invalid_title',
            error: 'Invalid title',
        });
    }

    if (!z.string().min(1).max(20000).safeParse(content).success) {
        return reply.status(400).send({
            code: 'invalid_content',
            error: 'Invalid content',
        });
    }

    const client = getClient();
    const id = randomString(16);

    const note = {
        id,
        title,
        content,
        date: Date.now(),
    };

    await client.query('INSERT INTO notes (id, title, content, date) VALUES ($1, $2, $3, $4)', [
        note.id,
        note.title,
        note.content,
        note.date,
    ]);

    const log = {
        ip: getIp(req),
        action: 'create_note',
        message: `Created note ${title}`,
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    createEntry('notes', id, note);
    createEntry('logs', log.date.toString(), log);

    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('CREATE_NOTE', note);

    return reply.status(200).send(note);
};
