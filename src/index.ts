import rapidenv from 'rapidenv';
import { connectToDatabase, prepareTables } from './util/database';
import { prepareDirs, prepareUploads, prepareCache } from './util/prepare';
import { initFastify } from './fastify';
import { initWebSocketServer } from './wss';

rapidenv().load();
prepareDirs();

await connectToDatabase();
await prepareTables();
await prepareUploads();
await prepareCache();
await initFastify();
initWebSocketServer();
