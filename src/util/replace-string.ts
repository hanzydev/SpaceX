import type { Upload } from '@/types';

export const replaceString = (str: string, upload: Upload) => {
    const params = {
        '{filename}': upload.id,
        '{filesize}': upload.size.formatted,
        '{filetype}': upload.type,
        '{filedate}': new Date(upload.date).toLocaleString(),
        '{date}': new Date().toLocaleString(),
    };

    return str.replace(
        /{filename}|{filesize}|{filetype}|{filedate}|{date}/g,
        (matched) => params[matched as keyof typeof params],
    );
};
