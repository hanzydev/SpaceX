import { authenticator } from 'otplib';
import rapidenv from 'rapidenv';
import { getIp } from '@util/get-ip';
import { getClient } from '@util/database';
import { dispatchEvent } from '@wss';
import { createEntry } from '@util/cache';

export const middlewares = ['only-json', 'auth'];
export const config = {
    rateLimit: {
        max: 3,
        time: 20_000,
    },
};

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const env = rapidenv();

    const { otp } = req.body as Record<string, any>;

    if (!z.string().min(1).max(6).safeParse(otp).success) {
        return reply.status(400).send({
            code: 'invalid_otp',
            error: 'Invalid otp',
        });
    }

    if (!authenticator.check(otp, process.env.TWO_FA_SECRET!)) {
        return reply.status(400).send({
            code: 'invalid_otp',
            error: 'Invalid otp',
        });
    }

    if (process.env.TWO_FA_ENABLED === 'true') {
        return reply.status(400).send({
            code: '2fa_already_enabled',
            error: 'Two-factor authentication system is already enabled',
        });
    }

    env.setVariable('TWO_FA_ENABLED', 'true');

    const client = getClient();

    const log = {
        ip: getIp(req),
        action: 'enable_2fa',
        message: 'Enabled two-factor authentication system',
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    createEntry('logs', log.date.toString(), log);
    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('ENABLE_2FA');

    return reply.status(204).send();
};
