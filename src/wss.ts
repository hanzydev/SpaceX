import { setTimeout as sleep } from 'node:timers/promises';
import os from 'node:os';
import { WebSocketServer, WebSocket, type AddressInfo } from 'ws';
import { destr } from 'destr';
import { getPCInfo } from './util/get-pc-info';
import { randomString } from './util/random-string';
import { getIp } from './util/get-ip';
import { verifyUser } from './util/verify-user';
import * as logger from './util/logger';
import type { PCInfo } from './types';
import { OPCodes } from './constants';

let pcInfo: PCInfo;

const updatePCInfo = async () => {
    if (os.platform() === 'win32') {
        pcInfo = await getPCInfo();
    } else {
        getPCInfo().then((info) => {
            pcInfo = info;
        });

        await sleep(1000);
    }

    updatePCInfo();
};

updatePCInfo();

const send = (ws: WebSocket, payload: { op: OPCodes; t?: string; d?: any }) => {
    if (ws.readyState !== WebSocket.OPEN) {
        return;
    }

    ws.send(JSON.stringify(payload));
};

let wss: WebSocketServer;

export const getClients = () => wss.clients;

export const initWebSocketServer = () => {
    wss = new WebSocketServer({ host: '0.0.0.0', port: +process.env.WSS_PORT });

    wss.on('listening', () => {
        const addr = wss.address() as AddressInfo;

        logger.info(`WebSocket server started on ${addr.address}:${addr.port}`);
    });

    wss.on('connection', (ws, req) => {
        logger.info(`New websocket connection from ${getIp(req)}`);

        ws['data'] = {
            identified: false,
            id: randomString(16),
        };

        send(ws, {
            op: OPCodes.Hello,
            d: {
                heartbeat_interval: 30000,
            },
        });

        ws.on('message', async (raw: Buffer) => {
            let payload: Record<string, any>;

            try {
                payload = destr(raw.toString());
            } catch {
                ws.close(4000, 'Invalid Payload');
                return;
            }

            const { op, d } = payload;

            switch (op) {
                case OPCodes.Identify:
                    const verified = await verifyUser(d.token);

                    if (!verified) {
                        ws.close(4001, 'Unauthorized');
                    } else if (ws['data'].identified) {
                        ws.close(4002, 'Already identified');
                    } else {
                        ws['data'].identified = true;

                        if (!pcInfo) {
                            pcInfo = await getPCInfo();
                        }

                        send(ws, {
                            op: OPCodes.Dispatch,
                            t: 'MONITOR',
                            d: pcInfo,
                        });

                        ws['data'].lastMonitorSent = pcInfo;
                        ws['data'].monitorInterval = setInterval(() => {
                            if (
                                JSON.stringify(ws['data'].lastMonitorSent) !==
                                JSON.stringify(pcInfo)
                            ) {
                                send(ws, {
                                    op: OPCodes.Dispatch,
                                    t: 'MONITOR',
                                    d: pcInfo,
                                });

                                ws['data'].lastMonitorSent = pcInfo;
                            }
                        }, 1000);
                    }
                    break;
                case OPCodes.Heartbeat:
                    send(ws, {
                        op: OPCodes.HeartbeatAck,
                    });
                    break;
                default:
                    ws.close(4000, 'Invalid OP code');
                    break;
            }
        });

        ws.on('close', () => {
            if (ws['data']?.identified) {
                clearInterval(ws['data'].monitorInterval);
            }
        });
    });
};
