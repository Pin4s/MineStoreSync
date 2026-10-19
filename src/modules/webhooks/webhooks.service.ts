
import { Status } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";



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

export async function updateWebhookStatus(status: Status, webhookEventId: string, message?: string) {

    await prisma.webhookEvents.update({
        where: { id: webhookEventId },
        data: {
            status: status,
            attempts: { increment: 1 },
            lastError: message,
            processedAt: status === Status.PROCESSED ? new Date() : null
        }
    })
}

export async function findWebhookEvents() {

    const webhookEvent = await prisma.webhookEvents.findFirst({
        where: { status: 'RECEIVED' },
        orderBy: { createdAt: 'asc' }
    })

    return webhookEvent
}

