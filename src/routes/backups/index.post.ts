import tar from 'tar';
import { execa } from 'execa';
import { getBackup } from '@util/backups';
import { createEntry } from '@util/cache';
import { getClient } from '@util/database';
import { getIp } from '@util/get-ip';
import { randomString } from '@util/random-string';
import { dispatchEvent } from '@wss';

export const middlewares = ['auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    reply.status(204).send();

    const tempPath = `./files/temp/${randomString(32)}`;

    mkdirSync(tempPath);
    cpSync('./files/uploads', `${tempPath}/uploads`, { recursive: true });
    cpSync('./files/embed-config.json', `${tempPath}/embed-config.json`);

    try {
        await execa(
            'pg_dump',
            [
                '-U',
                process.env.POSTGRES_USER,
                '-h',
                process.env.POSTGRES_HOST,
                '-p',
                process.env.POSTGRES_PORT,
                '-d',
                process.env.POSTGRES_DATABASE,
                '-f',
                `${tempPath}/database.sql`,
            ],
            {
                env: {
                    PGPASSWORD: process.env.POSTGRES_PASSWORD,
                },
            },
        );
    } catch {}

    const id = `${randomString(32)}.tgz`;
    const gzipPath = `./files/temp/${id}`;

    await tar.c(
        {
            z: { level: 9 },
            C: tempPath,
            file: gzipPath,
        },
        readdirSync(tempPath),
    );

    const date = new Date();
    const newId = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}.${randomString(8)}`;

    renameSync(gzipPath, `./files/backups/${newId}.tgz`);
    rmSync(tempPath, { recursive: true });

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
