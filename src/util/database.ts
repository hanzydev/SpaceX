import pg from 'pg';

import * as logger from './logger';

let client: pg.Client;

export const connectToDatabase = async () => {
    logger.info('Connecting to database');

    client = new pg.Client({
        host: process.env.POSTGRES_HOST,
        port: +process.env.POSTGRES_PORT,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
        application_name: 'SpaceX',
    });

    await client.connect();

    return client;
};

export const prepareTables = async (log = true) => {
    if (!client) {
        return;
    }

    if (log) {
        logger.info('Preparing tables');
    }

    await client.query(
        "CREATE TABLE IF NOT EXISTS uploads (id TEXT, size TEXT, type TEXT, date BIGINT, views TEXT DEFAULT '[]', private BOOLEAN DEFAULT FALSE, delete_after_views INTEGER DEFAULT 0)",
    );

    await client.query(
        'CREATE TABLE IF NOT EXISTS notes (id TEXT, title TEXT, content TEXT, date BIGINT)',
    );

    await client.query(
        "CREATE TABLE IF NOT EXISTS codes (id TEXT, title TEXT, content TEXT, date BIGINT, language TEXT, views TEXT DEFAULT '[]', private BOOLEAN DEFAULT FALSE, delete_after_views INTEGER DEFAULT 0)",
    );

    await client.query(
        "CREATE TABLE IF NOT EXISTS shortened_urls (id TEXT, url TEXT, date BIGINT, views TEXT DEFAULT '[]', private BOOLEAN DEFAULT FALSE, delete_after_views INTEGER DEFAULT 0)",
    );

    await client.query(
        "CREATE TABLE IF NOT EXISTS folders (id TEXT, name TEXT, date BIGINT, uploads TEXT DEFAULT '[]')",
    );

    await client.query(
        'CREATE TABLE IF NOT EXISTS logs (ip TEXT, action TEXT, message TEXT, date BIGINT)',
    );
};

export const getClient = () => client;
