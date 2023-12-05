import send from '@fastify/send';
import { getIp } from '@util/get-ip';
import { getClient } from '@util/database';
import { dispatchEvent } from '@wss';
import { getEntry, createEntry, deleteEntry, getEntries } from '@util/cache';
import authMiddleware from '../../../middlewares/auth';

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const id = req.params['id'];
    const ref = req.query['ref'];
    const upload = getEntry<Upload>('uploads', id);

    if (!upload) {
        return reply.status(404).send({
            code: 'upload_not_found',
            error: 'Upload not found',
        });
    }

    if (upload.private && (await authMiddleware(req, reply)) !== true) {
        return void 0;
    }

    if (req.query['log'] === 'true') {
        const client = getClient();
        const ip = getIp(req);

        upload.views = [...upload.views, { ip, date: Date.now() }];

        await client.query('UPDATE uploads SET views = $1 WHERE id = $2', [
            JSON.stringify(upload.views),
            id,
        ]);

        const log = {
            ip,
            action: 'view_upload',
            message: `Viewed upload ${id}`,
            date: Date.now(),
        };

        await client.query(
            'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
            Object.values(log),
        );

        createEntry('logs', log.date.toString(), log);
        createEntry('uploads', id, upload);
        dispatchEvent('CREATE_LOG', log);

        if (upload.deleteAfterViews && upload.views.length > upload.deleteAfterViews) {
            unlinkSync(`./files/uploads/${id}`);
            await client.query('DELETE FROM uploads WHERE id = $1', [id]);

            const log = {
                ip,
                action: 'delete_upload',
                message: `Deleted upload ${id} because it reached ${upload.deleteAfterViews} views`,
                date: Date.now(),
            };

            await client.query(
                'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
                Object.values(log),
            );

            deleteEntry('uploads', id);
            createEntry('logs', log.date.toString(), log);
            dispatchEvent('CREATE_LOG', log);
            dispatchEvent('DELETE_UPLOAD', { id });

            const folders = getEntries<Folder>('folders').filter((folder) =>
                folder.uploads.includes(id),
            );

            if (folders.length) {
                for await (const folder of folders) {
                    const uploads = folder.uploads;

                    uploads.splice(uploads.indexOf(id), 1);

                    await client.query('UPDATE folders SET uploads = $1 WHERE id = $2', [
                        JSON.stringify(uploads),
                        folder.id,
                    ]);

                    createEntry('folders', folder.id, { ...folder, uploads });
                    dispatchEvent('REMOVE_UPLOAD_FROM_FOLDER', {
                        folderId: folder.id,
                        uploadId: id,
                    });
                }
            }

            return reply.status(404).send({
                code: 'upload_not_found',
                error: 'Upload not found',
            });
        }
    }

    if (ref === 'direct') {
        reply.header('content-disposition', `attachment; filename="${id}"`);
    }

    if (ref === 'cdn' || ref === 'direct') {
        return reply.send(send(req.raw, id, { root: './files/uploads' }));
    }

    return reply.status(200).send({
        ...upload,
        views: {
            total: upload.views.length,
            today: upload.views.filter((view) => {
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
