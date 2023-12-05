import { getIp } from '@util/get-ip';
import * as logger from '@util/logger';
import { cache as getRoutes } from '../fastify/routes';

const rateLimitMap = new Map<
    string,
    {
        limit: number;
        reset: number;
        // eslint-disable-next-line no-undef
        sweeper: NodeJS.Timeout | null;
    }
>();

export default (req: FastifyRequest, reply: FastifyReply) => {
    const ip = getIp(req);
    const rateLimitKey = `${req.method}_${req.url}_${ip}`;
    const rateLimit = rateLimitMap.get(rateLimitKey);
    const route = getRoutes().find(
        (route) => route.regex.test(req.url) && route.method === req.method.toLowerCase(),
    );

    const pass = () => {
        logger.info(`${req.method} ${req.url} from ${ip}`);

        if (route && route.config.rateLimit && route.config.rateLimit.max !== 0) {
            reply.header('X-RateLimit-Limit', route.config.rateLimit.max);

            if (rateLimit) {
                reply.header(
                    'X-RateLimit-Remaining',
                    route.config.rateLimit.max - rateLimit.limit - 1,
                );
            } else {
                reply.header('X-RateLimit-Remaining', route.config.rateLimit.max - 1);
            }
        }

        return true;
    };

    const block = () => {
        logger.warn(
            `Rate limited exceeded for ${ip} and route ${req.method} ${req.url} from ${ip} (${route.config.rateLimit.max} requests in ${route.config.rateLimit.time}ms)`,
        );

        clearTimeout(rateLimit.sweeper);
        rateLimitMap.set(rateLimitKey, {
            limit: rateLimit.limit,
            reset: Date.now() + route.config.rateLimit.time,
            sweeper: setTimeout(
                () => rateLimitMap.delete(rateLimitKey),
                route.config.rateLimit.time,
            ),
        });

        reply
            .status(429)
            .headers({
                'X-RateLimit-Limit': route.config.rateLimit.max,
                'X-RateLimit-Remaining': 0,
                'X-RateLimit-Reset': route.config.rateLimit.time,
                'X-RateLimit-Reset-After': route.config.rateLimit.time / 1000,
            })
            .send({
                code: 'too_many_requests',
                error: 'You are being rate limited',
            });
    };

    if (!route || !route.config?.rateLimit || route.config.rateLimit.max === 0) {
        return pass();
    }

    if (rateLimit) {
        if (rateLimit.limit >= route.config.rateLimit.max || rateLimit.reset > Date.now()) {
            return block();
        } else {
            if (rateLimit.sweeper) {
                clearTimeout(rateLimit.sweeper);
            }

            rateLimitMap.set(rateLimitKey, {
                limit: rateLimit.limit + 1,
                reset: -1,
                sweeper: setTimeout(
                    () => rateLimitMap.delete(rateLimitKey),
                    route.config.rateLimit.time,
                ),
            });

            return pass();
        }
    } else {
        rateLimitMap.set(rateLimitKey, {
            limit: 1,
            reset: -1,
            sweeper: setTimeout(
                () => rateLimitMap.delete(rateLimitKey),
                route.config.rateLimit.time,
            ),
        });

        return pass();
    }
};
