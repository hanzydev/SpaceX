import type { FastifyReply, FastifyRequest } from 'fastify';
import { filesize } from 'filesize';
import { getEntries } from '../util/cache';
import type { Upload } from '../types';

export const middlewares = ['auth'];

export default (_: FastifyRequest, reply: FastifyReply) => {
    const uploads = getEntries<Upload>('uploads').sort((a, b) => b.date - a.date);

    const date = new Date();
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    let uploadTypes = uploads.reduce((acc, upload) => {
        if (!acc.includes(upload.type)) {
            acc.push(upload.type);
        }

        return acc;
    }, [] as string[]);

    const typesChartData = uploadTypes.map(
        (type: string) => uploads.filter((upload) => upload.type === type).length,
    );

    uploadTypes = uploadTypes.sort((a: string, b: string) => {
        const aCount = uploads.filter((upload) => upload.type === a).length;
        const bCount = uploads.filter((upload) => upload.type === b).length;

        return bCount - aCount;
    });

    let viewsChartData: number[] = [];

    for (const upload of uploads) {
        for (const view of upload.views) {
            const viewDate = new Date(view.date);

            if (viewDate.getFullYear() === date.getFullYear()) {
                viewsChartData[viewDate.getMonth()] =
                    (viewsChartData[viewDate.getMonth()] || 0) + 1;
            }
        }
    }

    viewsChartData = Array.from({ length: months.length }, (_, i) => viewsChartData[i] || 0);

    return reply.status(200).send({
        totalUploads: uploads.length,
        todayUploads: uploads.filter((upload) => {
            const date = new Date(upload.date);
            const today = new Date();

            return (
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()
            );
        }).length,
        storageUsed: filesize(
            uploads.reduce((total, upload) => total + upload.size.raw, 0),
            { base: 2, standard: 'jedec' },
        ) as string,
        views: {
            total: uploads.reduce((total, upload) => total + upload.views.length, 0),
            today: uploads.reduce((total, upload) => {
                const filtered = upload.views.filter((view) => {
                    const date = new Date(view.date);
                    const today = new Date();

                    return (
                        date.getDate() === today.getDate() &&
                        date.getMonth() === today.getMonth() &&
                        date.getFullYear() === today.getFullYear()
                    );
                });

                return total + filtered.length;
            }, 0),
        },
        chart: {
            views: {
                labels: months,
                data: viewsChartData,
            },
            types: {
                labels: uploadTypes,
                data: typesChartData,
            },
        },
    });
};
