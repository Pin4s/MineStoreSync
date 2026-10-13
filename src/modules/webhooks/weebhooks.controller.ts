import { FastifyReply, FastifyRequest } from "fastify";

export async function receiveWeebhook(
    request: FastifyRequest,
    reply: FastifyReply
) {
    console.log(request.body)

    return reply.code(200).send({
        message: "Webhook recebido"
    })
}