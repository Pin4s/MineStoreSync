import { FastifyReply, FastifyRequest } from "fastify";
import z, { ZodError } from "zod";
import { webhookSchema } from "./webhooks.schema";
import { createHmac, timingSafeEqual } from "node:crypto";



export async function receiveWebhook(
    request: FastifyRequest,
    reply: FastifyReply
) {


    const secret = process.env.CENTRALCART_WEBHOOK_SECRET

    if (!secret) return //i'll improve this later

    const signature = request.headers["x-centralcart-signature"];
    const timestamp = request.headers["x-centralcart-timestamp"];

    const expected = createHmac("sha256", secret)
        .update(`${timestamp}.${JSON.stringify(request.body)}`)
        .digest("hex");

    if (
        typeof signature !== "string" ||
        !/^[a-f0-9]{64}$/i.test(signature) ||
        typeof timestamp !== "string" ||
        !/^\d+$/.test(timestamp)
    ) {
        return reply.code(401).send({
            message: "Invalid signature"
        });
    }

    const isValid = timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expected, "hex")
    );

    if (!isValid) {
        return reply.code(401).send({
            message: "Invalid signature"
        });
    }

    const result = webhookSchema.safeParse(request.body)

    console.log(result.error)

    if (result.error) {
        reply.code(400).send({
            message: "Bad Request",
            result: result
        })
    }

    return reply.code(200).send({
        message: "Webhook recebido",
        result: result
    })
}