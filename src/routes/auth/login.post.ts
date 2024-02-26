import { verify } from 'argon2';
import { SignJWT } from 'jose';
import { authenticator } from 'otplib';

import { createEntry } from '@util/cache';
import { getClient } from '@util/database';
import { getIp } from '@util/get-ip';
import { dispatchEvent } from '@wss';

export const middlewares = ['only-json'];
export const config = {
    rateLimit: {
        max: 8,
        time: 60_000,
    },
};

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const { username, password, otp, cf_turnstile_token } = req.body as Record<string, string>;

    const ip = getIp(req);
    const client = getClient();

    const captchaFailed = async () => {
        const log = {
            ip,
            action: 'login',
            message: 'Captcha failed',
            date: Date.now(),
        };

        await client.query(
            'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
            Object.values(log),
        );

        createEntry('logs', log.date.toString(), log);
        dispatchEvent('CREATE_LOG', log);

        return reply.status(400).send({
            code: 'invalid_captcha',
            error: 'Invalid captcha',
        });
    };

    if (!cf_turnstile_token) {
        return await captchaFailed();
    }

    const formData = new FormData();

    formData.append('secret', process.env.TURNSTILE_SECRET_KEY!);
    formData.append('response', cf_turnstile_token);
    formData.append('remoteip', ip);

    const data: Record<string, any> = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
            method: 'POST',
            body: formData,
        },
    ).then((res) => res.json());

    if (!data.success) {
        return await captchaFailed();
    }

    if (username !== process.env.USERNAME || !(await verify(process.env.PASSWORD!, password))) {
        const log = {
            ip,
            action: 'login',
            message: 'Failed to login',
            date: Date.now(),
        };

        await client.query(
            'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
            Object.values(log),
        );

        createEntry('logs', log.date.toString(), log);
        dispatchEvent('CREATE_LOG', log);

        return reply.status(400).send({
            code: 'invalid_credentials',
            error: 'Invalid username or password',
        });
    }

    if (process.env.TWO_FA_ENABLED === 'true') {
        let isInvalid = false;

        if (!z.string().min(1).max(6).safeParse(otp).success) {
            isInvalid = true;
        }

        if (!authenticator.check(otp, process.env.TWO_FA_SECRET!)) {
            isInvalid = true;
        }

        if (isInvalid) {
            const log = {
                ip,
                action: 'login',
                message: 'Invalid otp',
                date: Date.now(),
            };

            await client.query(
                'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
                Object.values(log),
            );

            createEntry('logs', log.date.toString(), log);
            dispatchEvent('CREATE_LOG', log);

            return reply.status(400).send({
                code: 'invalid_otp',
                error: 'Invalid otp',
            });
        }
    }

    const log = {
        ip,
        action: 'login',
        message: 'Logged in',
        date: Date.now(),
    };

    await client.query(
        'INSERT INTO logs (ip, action, message, date) VALUES ($1, $2, $3, $4)',
        Object.values(log),
    );

    createEntry('logs', log.date.toString(), log);
    dispatchEvent('CREATE_LOG', log);

    const jwt = await new SignJWT({ username })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    return reply.status(200).send({
        jwt,
    });
};
