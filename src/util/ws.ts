import {
    useBackupsStore,
    useCodesStore,
    useEmbedConfigStore,
    useFoldersStore,
    useLogsStore,
    useMonitorStore,
    useNotesStore,
    useShortenedURLsStore,
    useStatsStore,
    useUserStore,
    useUploadsStore,
} from '@/store';
import { OPCodes } from '@/constants';

import folderEmitter from './emitters/folder';
import noteEmitter from './emitters/note';
import codeEmitter from './emitters/code';
import uploadEmitter from './emitters/upload';
import shortenedURLEmitter from './emitters/shortened-url';
import authEmitter from './emitters/auth';

export const initWebSocket = () => {
    const backupsStore = useBackupsStore();
    const codesStore = useCodesStore();
    const embedConfigStore = useEmbedConfigStore();
    const foldersStore = useFoldersStore();
    const logsStore = useLogsStore();
    const notesStore = useNotesStore();
    const statsStore = useStatsStore();
    const uploadsStore = useUploadsStore();
    const urlsStore = useShortenedURLsStore();
    const monitorStore = useMonitorStore();
    const userStore = useUserStore();

    const router = useRouter();

    const tokenCookie = useCookie('token');

    const createWS = () => {
        const ws = new WebSocket(import.meta.env.VITE_WSS_URL!);

        let heartbeatTimer: NodeJS.Timeout | null = null;
        let lastPingTimestamp = Date.now();

        const send = (payload: any) => {
            ws.send(JSON.stringify(payload));
            lastPingTimestamp = Date.now();
        };

        const sendHeartbeat = () => {
            send({
                op: OPCodes.Heartbeat,
            });
        };

        const setupHeartbeatTimer = (interval: number) => {
            if (heartbeatTimer) {
                clearInterval(heartbeatTimer);
            }

            heartbeatTimer = setInterval(() => {
                sendHeartbeat();
            }, interval);
        };

        ws.onmessage = (raw) => {
            const { op, d, t } = JSON.parse(raw.data);

            switch (op) {
                case OPCodes.Hello:
                    console.log(
                        `\x1B[38;2;3;198;252m\x1B[1m[ Space WS ]\x1B[0m Hello | ${
                            Date.now() - lastPingTimestamp
                        }ms`,
                    );

                    sendHeartbeat();
                    setupHeartbeatTimer(d.heartbeat_interval);

                    send({
                        op: OPCodes.Identify,
                        d: {
                            token: tokenCookie.value!,
                        },
                    });
                    break;
                case OPCodes.HeartbeatAck:
                    console.log(
                        `\x1B[38;2;3;198;252m\x1B[1m[ Space WS ]\x1B[0m Heartbeat Ack | ${
                            Date.now() - lastPingTimestamp
                        }ms`,
                    );
                    break;
                case OPCodes.Dispatch:
                    console.log(
                        `\x1B[38;2;3;198;252m\x1B[1m[ Space WS ]\x1B[0m Dispatch ${t}`,
                    );

                    switch (t) {
                        case 'CREATE_LOG':
                            logsStore.logs = [d, ...logsStore.logs];
                            break;
                        case 'CREATE_BACKUP':
                        case 'DELETE_BACKUP':
                            if (t === 'DELETE_BACKUP') {
                                backupsStore.backups =
                                    backupsStore.backups.filter(
                                        (backup) => backup.id !== d.id,
                                    );
                            } else {
                                backupsStore.backups = [
                                    d,
                                    ...backupsStore.backups,
                                ];
                            }
                            break;
                        case 'LOAD_BACKUP':
                            statsStore.fetchStats();
                            uploadsStore.fetchUploads();
                            notesStore.fetchNotes();
                            urlsStore.fetchShortenedURLs();
                            codesStore.fetchCodes();
                            foldersStore.fetchFolders();
                            logsStore.fetchLogs();
                            break;
                        case 'CREATE_CODE':
                        case 'DELETE_CODE':
                        case 'UPDATE_CODE':
                            if (t === 'DELETE_CODE') {
                                codesStore.codes = codesStore.codes.filter(
                                    (code) => code.id !== d.id,
                                );
                                codeEmitter.emit(t, d.id);
                            } else if (t === 'CREATE_CODE') {
                                codesStore.codes = [d, ...codesStore.codes];
                                codeEmitter.emit(t, d);
                            } else {
                                const i = codesStore.codes.findIndex(
                                    (code) => code.id === d.id,
                                );

                                if (i > -1) {
                                    codesStore.codes[i] = {
                                        ...codesStore.codes[i],
                                        ...d,
                                    };
                                }

                                codeEmitter.emit(t, d);
                            }
                            break;
                        case 'UPDATE_EMBED_CONFIG':
                            embedConfigStore.embedConfig = d;
                            break;
                        case 'CREATE_FOLDER':
                        case 'UPDATE_FOLDER':
                        case 'DELETE_FOLDER':
                            if (t === 'DELETE_FOLDER') {
                                foldersStore.folders =
                                    foldersStore.folders.filter(
                                        (folder) => folder.id !== d.id,
                                    );
                                folderEmitter.emit(t, d.id);
                            } else if (t === 'CREATE_FOLDER') {
                                foldersStore.folders = [
                                    d,
                                    ...foldersStore.folders,
                                ];
                                folderEmitter.emit(t, d);
                            } else {
                                const i = foldersStore.folders.findIndex(
                                    (folder) => folder.id === d.id,
                                );

                                if (i > -1) {
                                    foldersStore.folders[i] = {
                                        ...foldersStore.folders[i],
                                        ...d,
                                    };
                                }

                                folderEmitter.emit(t, d);
                            }
                            break;
                        case 'CREATE_NOTE':
                        case 'UPDATE_NOTE':
                        case 'DELETE_NOTE':
                            if (t === 'DELETE_NOTE') {
                                notesStore.notes = notesStore.notes.filter(
                                    (note) => note.id !== d.id,
                                );
                                noteEmitter.emit(t, d.id);
                            } else if (t === 'CREATE_NOTE') {
                                notesStore.notes = [d, ...notesStore.notes];
                                noteEmitter.emit(t, d);
                            } else {
                                const i = notesStore.notes.findIndex(
                                    (note) => note.id === d.id,
                                );

                                if (i > -1) {
                                    notesStore.notes[i] = {
                                        ...notesStore.notes[i],
                                        ...d,
                                    };
                                }

                                noteEmitter.emit(t, d);
                            }
                            break;
                        case 'CREATE_SHORTENED_URL':
                        case 'DELETE_SHORTENED_URL':
                        case 'UPDATE_SHORTENED_URL':
                            if (t === 'DELETE_SHORTENED_URL') {
                                urlsStore.shortenedURLs =
                                    urlsStore.shortenedURLs.filter(
                                        (shortenedURL) =>
                                            shortenedURL.id !== d.id,
                                    );
                                shortenedURLEmitter.emit(t, d.id);
                            } else if (t === 'CREATE_SHORTENED_URL') {
                                urlsStore.shortenedURLs = [
                                    d,
                                    ...urlsStore.shortenedURLs,
                                ];
                                shortenedURLEmitter.emit(t, d);
                            } else {
                                const i = urlsStore.shortenedURLs.findIndex(
                                    (shortenedURL) => shortenedURL.id === d.id,
                                );

                                if (i > -1) {
                                    urlsStore.shortenedURLs[i] = {
                                        ...urlsStore.shortenedURLs[i],
                                        id: d.newId,
                                        private: d.private,
                                        deleteAfterViews: d.deleteAfterViews,
                                    };
                                }

                                shortenedURLEmitter.emit(t, d.id, d.newId);
                            }
                            break;
                        case 'CREATE_UPLOAD':
                        case 'DELETE_UPLOAD':
                        case 'UPDATE_UPLOAD':
                            if (t === 'DELETE_UPLOAD') {
                                statsStore.fetchStats();
                                uploadsStore.uploads =
                                    uploadsStore.uploads.filter(
                                        (upload) => upload.id !== d.id,
                                    );
                                uploadEmitter.emit(t, d.id);
                            } else if (t === 'CREATE_UPLOAD') {
                                statsStore.fetchStats();
                                uploadsStore.uploads = [
                                    d,
                                    ...uploadsStore.uploads,
                                ];
                                uploadEmitter.emit(t, d);
                            } else {
                                const i = uploadsStore.uploads.findIndex(
                                    (upload) => upload.id === d.id,
                                );

                                if (i > -1) {
                                    uploadsStore.uploads[i] = {
                                        ...uploadsStore.uploads[i],
                                        id: d.newId,
                                        private: d.private,
                                        deleteAfterViews: d.deleteAfterViews,
                                    };
                                }

                                uploadEmitter.emit(t, d.id, d.newId);
                            }
                            break;
                        case 'ADD_UPLOAD_TO_FOLDER':
                        case 'REMOVE_UPLOAD_FROM_FOLDER':
                        case 'BULK_UPDATE_FOLDER_UPLOADS':
                            folderEmitter.emit(t, d);
                            break;
                        case 'MONITOR':
                            monitorStore.setData(d);
                            break;
                        case 'ENABLE_2FA':
                        case 'DISABLE_2FA':
                            userStore.set2FaEnabled(t === 'ENABLE_2FA');
                            break;
                        case 'UPDATE_CREDENTIALS':
                            ws.close(1000);
                            router.push('/auth/logout');
                            break;
                    }
                    break;
            }
        };

        ws.onclose = ({ code, reason }) => {
            console.log(
                `\x1B[38;2;3;198;252m\x1B[1m[ Space WS ]\x1B[0m Closed with code ${code} and reason ${reason}`,
            );

            if (heartbeatTimer) {
                clearInterval(heartbeatTimer);
            }

            const NON_RECONNECTABLE_CODES = [1000, 4001];

            if (!NON_RECONNECTABLE_CODES.includes(code)) {
                console.log(
                    '\x1B[38;2;3;198;252m\x1B[1m[ Space WS ]\x1B[0m Reconnect attempt in 5s',
                );

                setTimeout(() => {
                    createWS();
                }, 5000);
            }
        };

        return ws;
    };

    let ws: WebSocket | null = null;

    if (tokenCookie.value!) {
        ws = createWS();
    }

    authEmitter.on('login', () => {
        if (ws) {
            ws.close(1000);
        }

        ws = createWS();
    });
};
