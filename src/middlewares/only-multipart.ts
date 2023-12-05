export default (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.isMultipart()) {
        return reply.status(400).send({
            code: 'invalid_form_data',
            error: 'Invalid form data',
        });
    }

    return true;
};
