import type { MultipartFile, MultipartValue } from '@fastify/multipart';
import { extname } from 'node:path';
import sharp from 'sharp';
import { filesize } from 'filesize';
import { createEntry } from '@util/cache';
import { getIp } from '@util/get-ip';
import { getClient } from '@util/database';
import { dispatchEvent } from '@wss';
import { randomString } from '@util/random-string';

export const middlewares = ['only-multipart', 'auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const client = getClient();

    const createUpload = async (
        id: string,
        mimeType: string,
        isPrivate: boolean,
        deleteAfterViews: number,
    ) => {
        const size = statSync(`./files/uploads/${id}`).size;

        const upload = {
            id,
            size: {
                raw: size,
                formatted: filesize(size, {
                    base: 2,
                    standard: 'jedec',
                }) as string,
            },
            type: mimeType,
            date: Date.now(),
            views: { total: 0, today: 0 },
            private: isPrivate,
            deleteAfterViews,
        };

        await client.query(
            'INSERT INTO uploads (id, size, type, date, views, private, delete_after_views) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [
                upload.id,
                JSON.stringify(upload.size),
                upload.type,
                upload.date,
                '[]',
                isPrivate,
                deleteAfterViews,
            ],
        );

        const log = {
            ip: getIp(req),
            action: 'create_upload',
            message: `Created upload ${id}`,
            date: Date.now(),
        };

        await client.query(
            'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
            Object.values(log),
        );

        createEntry('uploads', id, { ...upload, views: [] });
        createEntry('logs', log.date.toString(), log);
        dispatchEvent('CREATE_LOG', log);
        dispatchEvent('CREATE_UPLOAD', upload);

        return { ...upload, url: `${process.env.SITE_URL}/u/${id}` };
    };

    const file = req.body['file'] as MultipartFile;

    if (!file || file.fieldname !== 'file') {
        return reply.status(400).send({
            code: 'invalid_file',
            error: 'Invalid file',
        });
    }

    const {
        id: _id,
        currentChunk: _currentChunk,
        totalChunks: _totalChunks,
        private: _private = { value: 'false' },
        deleteAfterViews: _deleteAfterViews = { value: '0' },
        quality: _quality = { value: '100' },
    } = req.body as {
        [field: string]: MultipartValue;
    };

    const isPrivate = _private.value === 'true';
    const deleteAfterViews = +_deleteAfterViews.value;
    const quality = +_quality.value;

    let id = _id?.value as string;

    if (
        typeof id === 'string' &&
        id.length &&
        !z
            .string()
            .min(1)
            .max(128)
            .regex(/^[a-zA-Z0-9-_]+$/)
            .safeParse(id).success
    ) {
        return reply.status(400).send({
            code: 'invalid_id',
            error: 'Invalid id',
        });
    }

    if (!(typeof id === 'string' && id.length)) {
        id = randomString(8);
    }

    if (!z.number().min(0).max(100000).safeParse(deleteAfterViews).success) {
        return reply.status(400).send({
            code: 'invalid_delete_after_views',
            error: 'Invalid delete after views',
        });
    }

    if (!z.number().min(1).max(100).safeParse(quality).success) {
        return reply.status(400).send({
            code: 'invalid_quality',
            error: 'Invalid quality',
        });
    }

    let buffer = await file.toBuffer();

    if (_currentChunk?.value && _totalChunks?.value) {
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

        if (currentChunk === totalChunks) {
            const ext = extname(file.filename);
            let fullname = `${id}${ext}`;

            if (existsSync(`./files/temp/${file.filename}`)) {
                appendFileSync(`./files/temp/${file.filename}`, buffer);
                renameSync(`./files/temp/${file.filename}`, `./files/uploads/${fullname}`);
            } else {
                writeFileSync(`./files/uploads/${fullname}`, buffer);
            }

            if (file.mimetype.startsWith('image/') && quality < 100 && quality > 0) {
                try {
                    writeFileSync(
                        `./files/uploads/${fullname}`,
                        await sharp(buffer).jpeg({ quality }).toBuffer(),
                    );
                    renameSync(
                        `./files/uploads/${fullname}`,
                        `./files/uploads/${fullname.replace(ext, '.jpg')}`,
                    );
                    fullname = fullname.replace(ext, '.jpg');
                } catch {}
            }

            return reply
                .status(200)
                .send(await createUpload(fullname, file.mimetype, isPrivate, deleteAfterViews));
        } else if (currentChunk === 1) {
            writeFileSync(`./files/temp/${file.filename}`, buffer);
        } else {
            appendFileSync(`./files/temp/${file.filename}`, buffer);
        }

        return reply.status(204).send();
    } else {
        const ext = extname(file.filename);
        let fullname = `${id}${ext}`;

        if (file.mimetype.startsWith('image/') && quality < 100 && quality > 0) {
            try {
                buffer = await sharp(buffer).jpeg({ quality }).toBuffer();
                fullname = fullname.replace(ext, '.jpg');
            } catch {}
        }

        writeFileSync(`./files/uploads/${fullname}`, buffer);

        return reply
            .status(200)
            .send(await createUpload(fullname, file.mimetype, isPrivate, deleteAfterViews));
    }
};
