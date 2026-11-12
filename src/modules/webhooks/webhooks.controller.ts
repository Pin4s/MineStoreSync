import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { env } from "../../config/env";
import { webhookSchema } from "./webhooks.schema";
import { verifyWebhookSignature } from "./webhooks.signature";
import { saveWebhook } from "./webhooks.service";
import { logPipeline, logPipelineError } from "../../lib/pipeline-log";

const rawBodySchema = z.instanceof(Buffer)
const jsonObjectSchema = z.record(z.string(), z.json())
const eventTypeSchema = z.object({ event: z.unknown() })

function parseJsonObject(rawBody: Buffer) {
    try {
        return jsonObjectSchema.safeParse(JSON.parse(rawBody.toString("utf8")))
    } catch {
        return undefined
    }
}

export async function receiveWebhook(
    request: FastifyRequest,
    reply: FastifyReply
) {

    logPipeline("webhook.received", { requestId: request.id });

    const rawBody = rawBodySchema.safeParse(request.body)

    if (!rawBody.success) {
        logPipeline("webhook.payload_rejected", { requestId: request.id, reason: "missing_body" });
        return reply.code(400).send({
            message: "Bad Request"
        });
    }

    if (env.ENVIRONMENT === "dev") {
        logPipeline("webhook.signature_bypassed", { requestId: request.id });
    } else {
        const check = verifyWebhookSignature({
            headers: request.headers,
            rawBody: rawBody.data,
            secret: env.CENTRALCART_WEBHOOK_SECRET,
            now: new Date(),
        })

        if (check !== "valid") {
            logPipeline("webhook.signature_rejected", { requestId: request.id, reason: check });
            return reply.code(401).send({
                message: "Invalid signature"
            });
        }
    }

    const body = parseJsonObject(rawBody.data)

    if (!body?.success) {
        logPipeline("webhook.payload_rejected", { requestId: request.id, reason: "invalid_json" });
        return reply.code(400).send({
            message: "Bad Request"
        });
    }

    const eventType = eventTypeSchema.safeParse(body.data)
    const event = eventType.success ? eventType.data.event : undefined

    if (event !== "ORDER_APPROVED") {
        console.info(`[Webhook] Ignored event ${String(event)}`)
        return reply.code(200).send({
            message: "Webhook ignored"
        });
    }

    const payload = webhookSchema.safeParse(body.data)

    if (!payload.success) {
        logPipeline("webhook.payload_rejected", { requestId: request.id, issues: payload.error.issues.length });
        return reply.code(400).send({
            message: "Bad Request",
            errors: payload.error.issues
        });
    }

    const { id: externalId } = payload.data
    logPipeline("webhook.validated", { requestId: request.id, externalId, eventType: event });

    try {
        const saved = await saveWebhook({ externalId, eventType: event, payload: body.data })
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
