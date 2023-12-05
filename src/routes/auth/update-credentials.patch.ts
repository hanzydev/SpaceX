import { authenticator } from 'otplib';
import { argon2id } from 'hash-wasm';
import { randomBytes } from 'node:crypto';
import rapidenv from 'rapidenv';
import { getIp } from '@util/get-ip';
import { getClient } from '@util/database';
import { dispatchEvent } from '@wss';
import { createEntry, getKeys, deleteEntry } from '@util/cache';
import { randomString } from '@util/random-string';

export const middlewares = ['only-json', 'auth'];
export const config = {
    rateLimit: {
        max: 5,
        time: 60_000,
    },
};

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const { username, password, otp } = req.body as Record<string, any>;

    if (
        !z
            .string()
            .min(1)
            .max(16)
            .regex(/^[a-zA-Z0-9-_]+$/)
            .safeParse(username).success
    ) {
        return reply.status(400).send({
            code: 'invalid_username',
            error: 'Invalid username',
        });
    }

    if (
        typeof password === 'string' &&
        password.length &&
        !z.string().min(1).max(64).safeParse(password).success
    ) {
        return reply.status(400).send({
            code: 'invalid_password',
            error: 'Invalid password',
        });
    }

    const client = getClient();
    const env = rapidenv();

    if (process.env.TWO_FA_ENABLED === 'true') {
        let isInvalid = false;

        if (!z.string().min(1).max(6).safeParse(otp).success) {
            isInvalid = true;
        }

        if (!authenticator.check(otp, process.env.TWO_FA_SECRET)) {
            isInvalid = true;
        }

        if (isInvalid) {
            return reply.status(400).send({
                code: 'invalid_otp',
                error: 'Invalid otp',
            });
        }
    }

    env.setVariable('USERNAME', username);
    env.setVariable('JWT_SECRET', randomString(64));

    if (typeof password === 'string' && password.length) {
        env.setVariable(
            'PASSWORD',
            await argon2id({
                password,
                salt: randomBytes(32),
                parallelism: 1,
                iterations: 2,
                memorySize: 65536,
                hashLength: 32,
                outputType: 'encoded',
            }),
        );
    }

    const log = {
        ip: getIp(req),
        action: 'update_credentials',
        message: 'Updated credentials',
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    createEntry('logs', log.date.toString(), log);
    dispatchEvent('CREATE_LOG', log);
    dispatchEvent('UPDATE_CREDENTIALS');

    for (const token of getKeys('other').filter((key) => key.startsWith('jwt_'))) {
        deleteEntry('other', token);
    }

    return reply.status(204).send();
};
