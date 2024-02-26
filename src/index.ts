import rapidenv from 'rapidenv';

import { connectToDatabase, prepareTables } from '@util/database';
import { prepareCache, prepareDirs, prepareUploads } from '@util/prepare';
import { initWebSocketServer } from '@wss';

import { initFastify } from './fastify';

rapidenv().load();
prepareDirs();

await connectToDatabase();
await prepareTables();
await prepareUploads();
await prepareCache();
await initFastify();
initWebSocketServer();
