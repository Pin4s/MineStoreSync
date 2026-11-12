
import { Prisma, WebhookEvents } from "../../generated/prisma/browser";
import { Status } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";



interface WebhookInput {
    externalId: string;
    eventType: string;
    payload: object;
}

export async function saveWebhook({
    externalId, eventType, payload,
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

export const MAX_ATTEMPTS = 5

export async function registerWebhookFailure(webhookEvent: WebhookEvents, message: string) {
    const attempts = webhookEvent.attempts + 1
    const reachedLimit = attempts >= MAX_ATTEMPTS

    return prisma.webhookEvents.update({
        where: { id: webhookEvent.id },
        data: {
            attempts,
            lastError: message,
            status: reachedLimit ? Status.FAILED : Status.RECEIVED,
            nextAttemptAt: reachedLimit ? undefined : new Date(Date.now() + 30_000), 
        },
    })
}

export async function updateWebhookStatus(status: Status, webhookEventId: string, message?: string, db: Prisma.TransactionClient = prisma) {

    await db.webhookEvents.update({
        where: { id: webhookEventId },
        data: {
            status: status,
            lastError: status === Status.PROCESSED ? null : message,
            processedAt: status === Status.PROCESSED ? new Date() : null
        }
    })
}

export async function findWebhookEvents() {

    const webhookEvent = await prisma.webhookEvents.findFirst({
        where: { status: Status.RECEIVED, nextAttemptAt: { lte: new Date() } },
        orderBy: { createdAt: 'asc' }
    })

    return webhookEvent
}

