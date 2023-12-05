import { verifyUser } from '@util/verify-user';

export const middlewares = ['auth'];

export default async (req: FastifyRequest, reply: FastifyReply) => {
    const token = req.query['token'] || req.headers['authorization'];

    return reply.status(200).send({
        ...(await verifyUser(token)),
        twoFaEnabled: process.env.TWO_FA_ENABLED === 'true',
    });
};
