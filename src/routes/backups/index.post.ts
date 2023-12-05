import type { FastifyReply, FastifyRequest } from 'fastify';
import { readdirSync, mkdirSync, cpSync, renameSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
import tar from 'tar';
import { getBackup } from '../../util/backups';
import { createEntry } from '../../util/cache';
import { getClient } from '../../util/database';
import { getIp } from '../../util/get-ip';
import { randomString } from '../../util/random-string';
import { dispatchEvent } from '../../util/wss';

export const middlewares = ['auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    reply.status(204).send();

    const tmpPath = `./files/tmp/${randomString(32)}`;

    mkdirSync(tmpPath);
    cpSync('./files/uploads', `${tmpPath}/uploads`, { recursive: true });
    cpSync('./embed-config.json', `${tmpPath}/embed-config.json`);

    await new Promise<void>((resolve) => {
        const _process = spawn(
            `pg_dump -U ${process.env.POSTGRES_USER} -h ${process.env.POSTGRES_HOST} -p ${process.env.POSTGRES_PORT} -d ${process.env.POSTGRES_DATABASE} -f ${tmpPath}/database.sql`,
            {
                shell: true,
                env: {
                    PGPASSWORD: process.env.POSTGRES_PASSWORD,
                },
            },
        );

        _process.on('exit', resolve);
    });

    const id = `${randomString(32)}.tar.gz`;
    const gzipPath = `./files/tmp/${id}`;

    await tar.c(
        {
            z: { level: 9 },
            C: tmpPath,
            file: gzipPath,
        },
        readdirSync(tmpPath),
    );

    const date = new Date();
    const newId = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}.${randomString(8)}`;

    renameSync(gzipPath, `./files/backups/${newId}.tar.gz`);
    rmSync(tmpPath, { recursive: true });

    const client = getClient();

    const log = {
        ip: getIp(req),
        action: 'create_backup',
        message: `Created backup ${newId}`,
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    const backup = getBackup(newId);

    createEntry('backups', newId, backup);
    createEntry('logs', log.date.toString(), log);
    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('CREATE_BACKUP', backup!);
};
