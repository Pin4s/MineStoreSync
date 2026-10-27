import { FastifyReply, FastifyRequest } from "fastify";
import { webhookSchema } from "./webhooks.schema";
import { createHmac, timingSafeEqual } from "node:crypto";
import { saveWebhook } from "./webhooks.service";
import { logPipeline, logPipelineError } from "../../lib/pipeline-log";

export async function receiveWebhook(
    request: FastifyRequest,
    reply: FastifyReply
) {

    logPipeline("webhook.received", { requestId: request.id });

    if (process.env.ENVIROMENT !== "dev") {

        const secret = process.env.CENTRALCART_WEBHOOK_SECRET

        if (!secret) {
            logPipeline("webhook.signature_unavailable", { requestId: request.id });
            return;
        }

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
            logPipeline("webhook.signature_rejected", { requestId: request.id, reason: "invalid_headers" });
            return reply.code(401).send({
                message: "Invalid signature"
            });
        }

        const isValid = timingSafeEqual(
            Buffer.from(signature, "hex"),
            Buffer.from(expected, "hex")
        );

        if (!isValid) {
            logPipeline("webhook.signature_rejected", { requestId: request.id, reason: "mismatch" });
            return reply.code(401).send({
                message: "Invalid signature"
            });
        }
    }

    const payload = webhookSchema.safeParse(request.body)

    if (!payload.success) {
        logPipeline("webhook.payload_rejected", { requestId: request.id, issues: payload.error.issues.length });
        return reply.code(400).send({
            message: "Bad Request",
            errors: payload.error.issues
        });
    }

    const { id: externalId, event: eventType } = payload.data
    logPipeline("webhook.validated", { requestId: request.id, externalId, eventType });

    try {
        const saved = await saveWebhook({ externalId, eventType, payload: request.body as object })
        logPipeline("webhook.saved", { requestId: request.id, webhookEventId: saved.id, externalId });
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
            logPipeline("webhook.duplicate", { requestId: request.id, externalId });
            return reply.code(200).send({
                message: "Webhook already received"
            });
        }

        logPipelineError("webhook.save_failed", error, { requestId: request.id, externalId });
        throw error;
    }
}