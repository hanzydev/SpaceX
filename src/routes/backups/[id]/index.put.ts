import { basename } from 'node:path';

import { execa } from 'execa';
import tar from 'tar';

import type { MultipartFile, MultipartValue } from '@fastify/multipart';
import { createEntry, deleteCache, getEntry } from '@util/cache';
import { getClient, prepareTables } from '@util/database';
import { getIp } from '@util/get-ip';
import { prepareCache, prepareUploads } from '@util/prepare';
import { randomString } from '@util/random-string';
import { dispatchEvent } from '@wss';

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
        file.fieldname !== 'file' ||
        !['application/x-gzip', 'application/gzip', 'application/x-compressed'].includes(
            file.mimetype,
        )
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
        if (existsSync(`./files/temp/${file.filename}`)) {
            appendFileSync(`./files/temp/${file.filename}`, buffer);
        } else {
            writeFileSync(`./files/temp/${file.filename}`, buffer);
        }

        await loadBackup(`./files/temp/${file.filename}`);
        rmSync(`./files/temp/${file.filename}`);
    } else if (currentChunk === 1) {
        writeFileSync(`./files/temp/${file.filename}`, buffer);
    } else {
        appendFileSync(`./files/temp/${file.filename}`, buffer);
    }
};

const _loadBackup = async (filePath: string) => {
    const tempPath = `./files/temp/${randomString(32)}`;

    mkdirSync(tempPath);

    await tar.x({
        C: tempPath,
        file: filePath,
    });

    const client = getClient();

    await client.query(
        'DROP TABLE IF EXISTS uploads, notes, logs, codes, shortened_urls, folders CASCADE',
    );

    if (existsSync(`${tempPath}/database.sql`)) {
        try {
            await execa(
                'psql',
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
    } else {
        await prepareTables(false);
    }

    deleteCache('uploads');
    deleteCache('notes');
    deleteCache('logs');
    deleteCache('codes');
    deleteCache('shortened_urls');
    deleteCache('folders');

    rmSync('./files/uploads', { recursive: true });
    rmSync('./files/embed-config.json');
    renameSync(`${tempPath}/uploads`, './files/uploads');
    renameSync(`${tempPath}/embed-config.json`, './files/embed-config.json');

    if (!existsSync(`${tempPath}/database.sql`)) {
        await prepareUploads();
    }

    rmSync(tempPath, { recursive: true });
    await prepareCache();
};
