import { getIp } from '@util/get-ip';
import { getClient } from '@util/database';
import { dispatchEvent } from '@wss';
import { getEntry, createEntry } from '@util/cache';

export const middlewares = ['only-json', 'auth'];
export const config = {
    rateLimit: {
        max: 3,
        time: 20_000,
    },
};

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const { enabled, color, title, description, author, site_name } = req.body as Record<
        string,
        any
    >;

    const embedConfig = getEntry('other', 'embed-config') as Record<string, any>;

    if (z.boolean().safeParse(enabled).success) {
        embedConfig.enabled = enabled;
    }

    if (z.string().safeParse(color).success) {
        if (
            !z
                .string()
                .regex(/^#[0-9A-F]{6}$/i)
                .safeParse(color).success
        ) {
            return reply.status(400).send({
                code: 'invalid_color',
                error: 'Invalid color',
            });
        }

        embedConfig.color = color;
    }

    if (z.string().safeParse(title).success) {
        embedConfig.title = title;
    }

    if (z.string().safeParse(description).success) {
        embedConfig.description = description;
    }

    if (z.string().safeParse(author).success) {
        embedConfig.author = author;
    }

    if (z.string().safeParse(site_name).success) {
        embedConfig.site_name = site_name;
    }

    writeFileSync('./embed-config.json', JSON.stringify(embedConfig, null, 4));

    const log = {
        ip: getIp(req),
        action: 'update_embed',
        message: 'Updated embed config',
        date: Date.now(),
    };

    const client = getClient();

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    createEntry('logs', log.date.toString(), log);
    createEntry('other', 'embed-config', embedConfig);

    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('UPDATE_EMBED_CONFIG', embedConfig);

    return reply.status(204).send();
};
