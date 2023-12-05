import type { FastifyReply, FastifyRequest } from 'fastify';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import rapidenv from 'rapidenv';

export const middlewares = ['auth'];
export const config = {
    rateLimit: {
        max: 3,
        time: 20_000,
    },
};

export default async (_: FastifyRequest, reply: FastifyReply) => {
    const env = rapidenv();

    if (process.env.TWO_FA_ENABLED === 'true') {
        return reply.status(400).send({
            code: '2fa_already_enabled',
            error: 'Once the two-factor authentication system is turned on, the qr code cannot be accessed',
        });
    }

    env.setVariable('TWO_FA_SECRET', authenticator.generateSecret(64));

    const base64 = await qrcode.toDataURL(
        authenticator.keyuri(process.env.USERNAME!, 'SpaceX', process.env.TWO_FA_SECRET!),
    );

    return reply.status(200).send({
        base64,
    });
};
