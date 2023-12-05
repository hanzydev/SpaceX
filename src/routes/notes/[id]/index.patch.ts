import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { getIp } from '../../../util/get-ip';
import { getClient } from '../../../util/database';
import { dispatchEvent } from '../../../util/wss';
import { getEntry, createEntry } from '../../../util/cache';
import type { Note } from '../../../types';

export const middlewares = ['only-json', 'auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const id = req.params['id'];
    const note = getEntry<Note>('notes', id);

    if (!note) {
        return reply.status(404).send({
            code: 'note_not_found',
            error: 'Note not found',
        });
    }

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

    await client.query('UPDATE notes SET title = $1, content = $2 WHERE id = $3', [
        title,
        content,
        id,
    ]);

    let logMessage = '';

    if (note.title !== title && note.content !== content) {
        logMessage = `Updated note ${note.title} to ${title} and updated content`;
    } else if (note.title !== title) {
        logMessage = `Updated note ${note.title} to ${title}`;
    } else if (note.content !== content) {
        logMessage = `Updated content of note ${title}`;
    }

    const log = {
        ip: getIp(req),
        action: 'update_note',
        message: logMessage,
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    createEntry('notes', id, { ...note, title, content });
    createEntry('logs', log.date.toString(), log);

    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('UPDATE_NOTE', { id, title, content });

    return reply.status(200).send({
        ...note,
        title,
        content,
    });
};
