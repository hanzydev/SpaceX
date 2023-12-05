import type { MultipartFile, MultipartValue } from '@fastify/multipart';
import { basename } from 'node:path';
import { spawn } from 'node:child_process';
import tar from 'tar';
import { createEntry, getEntry, deleteCache } from '@util/cache';
import { getIp } from '@util/get-ip';
import { getClient } from '@util/database';
import { dispatchEvent } from '@wss';
import { randomString } from '@util/random-string';
import { prepareCache, prepareUploads } from '@util/prepare';
import onlyMultipart from '../../../middlewares/only-multipart';

export const middlewares = ['auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const client = getClient();

    const loadBackup = async (filePath: string) => {
        await _loadBackup(filePath);

        const log = {
            ip: getIp(req),
            action: 'load_backup',
            message: `Loaded backup ${id}`,
            date: Date.now(),
        };

        await client.query(
            'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
            Object.values(log),
        );

        createEntry('logs', log.date.toString(), log);
        dispatchEvent('CREATE_LOG', log);
        dispatchEvent('LOAD_BACKUP', { id: basename(filePath, '.tar.gz') });
    };

    const id = req.params['id'];

    if (id) {
        if (!getEntry('backups', id)) {
            return reply.status(404).send({
                code: 'backup_not_found',
                error: 'Backup not found',
            });
        }

        reply.status(204).send();
        return await loadBackup(`./files/backups/${id}.tar.gz`);
    }

    if ((await onlyMultipart(req, reply)) !== true) {
        return;
    }

    const file = req.body['file'] as MultipartFile;

    if (
        !file ||
        !file.filename.endsWith('.tar.gz') ||
        file.fieldname !== 'file' ||
        (file.mimetype !== 'application/x-gzip' && file.mimetype !== 'application/gzip')
    ) {
        return reply.status(400).send({
            code: 'invalid_backup_file',
            error: 'Invalid backup file',
        });
    }

    const { currentChunk: _currentChunk, totalChunks: _totalChunks } = req.body as {
        [field: string]: MultipartValue;
    };

    const currentChunk = +_currentChunk.value;
    const totalChunks = +_totalChunks.value;

    if (!z.number().min(1).safeParse(currentChunk).success) {
        return reply.status(400).send({
            code: 'invalid_current_chunk',
            error: 'Invalid current chunk',
        });
    }

    if (!z.number().min(1).safeParse(totalChunks).success) {
        return reply.status(400).send({
            code: 'invalid_total_chunks',
            error: 'Invalid total chunks',
        });
    }

    const buffer = await file.toBuffer();

    reply.status(204).send();

    if (currentChunk === totalChunks) {
        if (existsSync(`./files/tmp/${file.filename}`)) {
            appendFileSync(`./files/tmp/${file.filename}`, buffer);
        } else {
            writeFileSync(`./files/tmp/${file.filename}`, buffer);
        }

        await loadBackup(`./files/tmp/${file.filename}`);
        rmSync(`./files/tmp/${file.filename}`);
    } else if (currentChunk === 1) {
        writeFileSync(`./files/tmp/${file.filename}`, buffer);
    } else {
        appendFileSync(`./files/tmp/${file.filename}`, buffer);
    }
};

const _loadBackup = async (filePath: string) => {
    const tmpPath = `./files/tmp/${randomString(32)}`;

    mkdirSync(tmpPath);

    await tar.x({
        C: tmpPath,
        file: filePath,
    });

    const client = getClient();

    await client.query('DELETE FROM uploads');
    await client.query('DELETE FROM notes');
    await client.query('DELETE FROM logs');
    await client.query('DELETE FROM codes');
    await client.query('DELETE FROM shortened_urls');
    await client.query('DELETE FROM folders');

    if (existsSync(`${tmpPath}/database.sql`)) {
        await new Promise<void>((resolve) => {
            const _process = spawn(
                `psql -U ${process.env.POSTGRES_USER} -h ${process.env.POSTGRES_HOST} -p ${process.env.POSTGRES_PORT} -d ${process.env.POSTGRES_DATABASE} -f ${tmpPath}/database.sql`,
                {
                    shell: true,
                    env: {
                        PGPASSWORD: process.env.POSTGRES_PASSWORD,
                    },
                },
            );

            _process.on('exit', resolve);
        });
    }

    deleteCache('uploads');
    deleteCache('notes');
    deleteCache('logs');
    deleteCache('codes');
    deleteCache('shortened_urls');
    deleteCache('folders');

    rmSync('./files/uploads', { recursive: true });
    rmSync('./embed-config.json');
    renameSync(`${tmpPath}/uploads`, './files/uploads');
    renameSync(`${tmpPath}/embed-config.json`, './embed-config.json');

    if (!existsSync(`${tmpPath}/database.sql`)) {
        await prepareUploads();
    }

    rmSync(tmpPath, { recursive: true });
    await prepareCache();
};
