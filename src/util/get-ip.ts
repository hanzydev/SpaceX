import type { FastifyRequest } from 'fastify';
import type { IncomingMessage } from 'node:http';

export const getIp = (req: FastifyRequest | IncomingMessage): string => {
    const ip =
        req.headers['x-forwarded-for'] ||
        req.headers['cf-connecting-ip'] ||
        req.headers['x-real-ip'] ||
        req.socket.remoteAddress;

    if (Array.isArray(ip)) {
        return ip[0];
    }

    if (typeof ip === 'string' && ip.includes(',')) {
        return ip.split(',')[0];
    }

    return ip;
};
