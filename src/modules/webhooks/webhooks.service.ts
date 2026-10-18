
import { prisma } from "../../lib/prisma";

enum Status {
    RECEIVED = "RECEIVED",
    PROCESSING = "PROCESSING",
    APPROVED = "APPROVED",
    FAILED = "FAILED",
}

interface WebhookInput {
    externalId: string;
    eventType: string;
    payload: object;
}

export async function saveWebhook({
    externalId, eventType, payload
}: WebhookInput) {


    const result = await prisma.webhookEvents.create({
        data: {
            externalId,
            eventType,
            payload //thats refere at the "data", thats come from request
        }
    })

    return result
}