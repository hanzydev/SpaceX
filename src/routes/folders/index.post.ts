import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { getIp } from '../../util/get-ip';
import { getClient } from '../../util/database';
import { dispatchEvent } from '../../util/wss';
import { createEntry } from '../../util/cache';
import { randomString } from '../../util/random-string';

export const middlewares = ['only-json', 'auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const { name } = req.body as Record<string, any>;

    if (!z.string().min(1).max(32).safeParse(name).success) {
        return reply.status(400).send({
            code: 'invalid_name',
            error: 'Invalid name',
        });
    }

    const client = getClient();
    const id = randomString(16);

    const folder = {
        id,
        name,
        date: Date.now(),
        uploads: [],
    };

    await client.query('INSERT INTO folders (id, name, date, uploads) VALUES ($1, $2, $3, $4)', [
        folder.id,
        folder.name,
        folder.date,
        '[]',
    ]);

    const log = {
        ip: getIp(req),
        action: 'create_folder',
        message: `Created folder ${name}`,
        date: Date.now(),
    };

    await client.query('INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)', [
        log.ip,
        log.action,
        log.message,
        log.date,
    ]);

    createEntry('logs', log.date.toString(), log);
    createEntry('folders', id, folder);
    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('CREATE_FOLDER', folder);

    return reply.status(200).send(folder);
};
