import { jwtVerify } from 'jose';

import { createEntry, getEntry } from './cache';

export const verifyUser = async (jwt: string) => {
    const verifiedEntry = getEntry<any>('other', `jwt_${jwt}`);

    if (verifiedEntry) {
        if (!verifiedEntry.verified) {
            return false;
        } else {
            return verifiedEntry.payload;
        }
    }

    if (!jwt) {
        return false;
    }

    try {
        const verified = await jwtVerify(jwt, new TextEncoder().encode(process.env.JWT_SECRET));

        if (!verified || verified.payload.username !== process.env.USERNAME) {
            createEntry('other', `jwt_${jwt}`, { verified: false });
            return false;
        }

        createEntry('other', `jwt_${jwt}`, {
            verified: true,
            payload: {
                username: verified.payload.username,
            },
        });

        return {
            username: verified.payload.username,
        };
    } catch {
        createEntry('other', `jwt_${jwt}`, { verified: false });
        return false;
    }
};
