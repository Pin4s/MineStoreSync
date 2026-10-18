import { FastifyReply, FastifyRequest } from "fastify";
import { webhookSchema } from "./webhooks.schema";
import { createHmac, timingSafeEqual } from "node:crypto";
import { saveWebhook } from "./webhooks.service";

export async function receiveWebhook(
    request: FastifyRequest,
    reply: FastifyReply
) {

    if (process.env.ENVIROMENT !== "dev") {

        const secret = process.env.CENTRALCART_WEBHOOK_SECRET

        if (!secret) return  

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
    }

    const payload = webhookSchema.safeParse(request.body)

    if (!payload.success) {
        return reply.code(400).send({
            message: "Bad Request",
            errors: payload.error.issues
        });
    }

    const { id: externalId, event: eventType } = payload.data

    try {
        const saved = await saveWebhook({ externalId, eventType, payload: request.body as object })
        return reply.code(200).send({
            message: "Webhook received",
            id: saved.id,
            status: saved.status
        })
    } catch (error) {
        if (error instanceof Error
            && "code" in error &&
            error.code === "P2002"
        ) {
            return reply.code(200).send({
                message: "Webhook already received"
            });
        }

        throw error;
    }
}