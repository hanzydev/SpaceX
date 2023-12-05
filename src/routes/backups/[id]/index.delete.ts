import type { FastifyReply, FastifyRequest } from 'fastify';
import { rmSync } from 'node:fs';
import { getIp } from '../../../util/get-ip';
import { getClient } from '../../../util/database';
import { dispatchEvent } from '../../../util/wss';
import { createEntry, deleteEntry, getEntry } from '../../../util/cache';
import type { Backup } from '../../../types';

export const middlewares = ['auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const id = req.params['id'];
    const backup = getEntry<Backup>('backups', id);

    if (!backup) {
        return reply.status(404).send({
            code: 'backup_not_found',
            error: 'Backup not found',
        });
    }

    rmSync(`./files/backups/${id}.tar.gz`);

    const client = getClient();

    const log = {
        ip: getIp(req),
        action: 'delete_backup',
        message: `Deleted backup ${id}`,
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    deleteEntry('backups', id);
    createEntry('logs', log.date.toString(), log);
    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('DELETE_BACKUP', { id });

    return reply.status(204).send();
};
