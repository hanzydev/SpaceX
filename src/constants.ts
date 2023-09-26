// # CONFIGURATIONS
export const SITE_URL = 'fill-me';
export const API_URL = 'fill-me';
export const WSS_URL = 'fill-me';
export const CF_TURNSTILE_SITE_KEY = 'fill-me';
export const CHUNK_SIZE_IN_MB = 10;

// # DO NOT CHANGE THIS!
export const BASE_SXCU = {
    Version: '14.1.0',
    Name: 'SpaceX ({name})',
    DestinationType: '',
    RequestMethod: 'POST',
    RequestURL: API_URL,
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
