// # CONFIGURATIONS
export const CHUNK_SIZE_IN_MB = 10;

console.log(import.meta.env);

// # DO NOT CHANGE THIS!
export const BASE_SXCU = {
    Version: '14.1.0',
    Name: 'SpaceX ({name})',
    DestinationType: '',
    RequestMethod: 'POST',
    RequestURL: import.meta.env.VITE_API_URL,
    Headers: {
        Authorization: '',
    },
    Body: '',
    URL: '',
    ErrorMessage: '{json:error}',
};

// # DO NOT CHANGE THIS!
export enum OPCodes {
    Hello = 0,
    Identify = 1,
    Heartbeat = 2,
    HeartbeatAck = 3,
    Dispatch = 4,
}
