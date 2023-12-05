import { WebSocket } from 'ws';
import { getClients } from '../wss';
import { OPCodes } from '../constants';

export const broadcast = (payload: Record<string, any>) => {
    const clients = getClients();

    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN && client['data'].identified) {
            client.send(JSON.stringify(payload));
        }
    }

    return clients.size;
};

export const dispatchEvent = (eventName: string, d = {}) =>
    broadcast({
        op: OPCodes.Dispatch,
        t: eventName,
        d,
    });
