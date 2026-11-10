import { findOrCreatePlayerByNickname } from "../modules/players/players.service";
import { createPurchase } from "../modules/purchases/purchase.service";
import { webhookSchema } from "../modules/webhooks/webhooks.schema";
import { findWebhookEvents, MAX_ATTEMPTS, registerWebhookFailure, updateWebhookStatus } from "../modules/webhooks/webhooks.service";
import { Status } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";

const workerLogPrefix = "[WebhookEventsWorker]"

export async function processorWebhookEvent() {
    console.info(`${workerLogPrefix} Searching for a received webhook event`)
    const webhookEvent = await findWebhookEvents()

    if (!webhookEvent) {
        console.info(`${workerLogPrefix} No received webhook events found`)
        return false
    }

    console.info(
        `${workerLogPrefix} Processing event ${webhookEvent.id} (${webhookEvent.eventType})`
    )

    try {
        console.info(`${workerLogPrefix} Validating event ${webhookEvent.id}`)
        const webhook = webhookSchema.parse(webhookEvent.payload)


        await prisma.$transaction(async (tx) => {
            console.info(`${workerLogPrefix} Resolving player for event ${webhookEvent.id}`)
            const player = await findOrCreatePlayerByNickname(webhook.data.client_identifier, tx)

            console.info(
                `${workerLogPrefix} Player ${player.id} resolved for event ${webhookEvent.id}`
            )

            console.info(`${workerLogPrefix} Creating purchase for event ${webhookEvent.id}`)
            const purchase = await createPurchase({
                playerId: player.id,
                webhookEventId: webhookEvent.id,
                externalPurchaseId: webhook.data.internal_id,
                amountCents: Math.round(webhook.data.price * 100),
                purchasedAt: new Date(webhook.data.paid_at ?? webhook.date)
            }, tx)

            console.info(
                `${workerLogPrefix} Purchase ${purchase.id} created or found for event ${webhookEvent.id}`
            )
            console.info(`${workerLogPrefix} Marking event ${webhookEvent.id} as processed`)
            await updateWebhookStatus(Status.PROCESSED, webhookEvent.id, undefined, tx)
        })
        console.info(`${workerLogPrefix} Event ${webhookEvent.id} processed successfully`)


    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : String(error)

        console.error(`${workerLogPrefix} Event ${webhookEvent.id} processing:`, error)
        const failedEvent = await registerWebhookFailure(webhookEvent, message)

        if (failedEvent.status === Status.FAILED) {
            console.info(
                `${workerLogPrefix} Event ${webhookEvent.id} attempt ${failedEvent.attempts}/${MAX_ATTEMPTS} failed, no more retries`
            )
        } else {
            console.info(
                `${workerLogPrefix} Event ${webhookEvent.id} attempt ${failedEvent.attempts}/${MAX_ATTEMPTS} failed, next attempt at ${failedEvent.nextAttemptAt.toISOString()}`
            )
        }

    }

    return true
}
