import { FastifyReply, FastifyRequest } from "fastify";
import z, { ZodError } from "zod";
import { webhookSchema } from "./webhooks.schema";

export async function receiveWebhook(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const result = webhookSchema.safeParse(request.body)

    console.log(result.error)

    if(result.error){
        reply.code(400).send({
            message: "Bad Request"
        })
    }

    return reply.code(200).send({
        message: "Webhook recebido"
    })
}