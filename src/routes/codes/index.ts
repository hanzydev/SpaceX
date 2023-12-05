import { getEntries } from '@util/cache';

export const middlewares = ['auth'];

export default (_: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send(
        getEntries<Code>('codes')
            .sort((a, b) => b.date - a.date)
            .map((code) => ({
                ...code,
                views: {
                    total: code.views.length,
                    today: code.views.filter((view) => {
                        const date = new Date(view.date);
                        const today = new Date();

                        return (
                            date.getDate() === today.getDate() &&
                            date.getMonth() === today.getMonth() &&
                            date.getFullYear() === today.getFullYear()
                        );
                    }).length,
                },
            })),
    );
};
