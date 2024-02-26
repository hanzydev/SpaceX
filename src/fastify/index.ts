import type { AddressInfo } from 'node:net';

import Fastify from 'fastify';

import FastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import * as logger from '@util/logger';

import { generateMiddlewares } from './middlewares';
import { generateRoutes } from './routes';

export const initFastify = async () => {
    const routes = await generateRoutes();
    const middlewares = await generateMiddlewares();

    const app = Fastify({
        maxParamLength: 200,
    });

    await app.register(FastifyCors, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    });

    await app.register(fastifyMultipart, {
        limits: {
            fileSize: 30 * 1024 * 1024, // 30 MB,
        },
        attachFieldsToBody: true,
    });

    app.setNotFoundHandler((req, res) => {
        const route = routes.find((route) => route.regex.test(req.url));

        if (route) {
            return res.status(405).send({
                code: 'method_not_allowed',
                error: `Method ${req.method} not allowed for route ${req.url}`,
            });
        }

        return res.status(404).send({
            code: 'not_found',
            error: `Route ${req.method} ${req.url} not found`,
        });
    });

    app.setErrorHandler((err, _, res) => {
        if (err.code) {
            err.code = err.code.replace('FST_', '');
        }

        return res.status(500).send({
            code: (err.code ?? err.name ?? 'unhandled_error').toLowerCase(),
            error: err.message ?? 'An unhandled error occurred',
        });
    });

    const globalMiddlewares = middlewares.filter((m) => m.global).map((m) => m.fn);

    app.addHook('onRequest', async (req, reply) => {
        let block = false;

        for (const fn of globalMiddlewares) {
            const result = await fn(req, reply);

            if (result !== true) {
                block = true;
                break;
            }
        }

        return !block;
    });

    for (const route of routes) {
        const routeMiddlewares = route.middlewares
            .map((m) => middlewares.find((m2) => m2.name === m))
            .filter((m) => m && !m.global)
            .map((m) => m.fn);

        app.route({
            method: route.method,
            url: route.path,
            config: route.config,
            handler: async (req, reply) => {
                let block = false;

                for (const fn of routeMiddlewares) {
                    const result = await fn?.(req, reply);

                    if (result !== true) {
                        block = true;
                        break;
                    }
                }

                if (block) {
                    return;
                }

                return route.fn(req, reply);
            },
        });
    }

    app.listen(
        {
            port: +process.env.API_PORT,
            host: '0.0.0.0',
        },
        (err) => {
            if (err) {
                return logger.error(err.message);
            }

            const addr = app.server.address() as AddressInfo;

            logger.info(`API started on ${addr.address}:${addr.port}`);
        },
    );
};
