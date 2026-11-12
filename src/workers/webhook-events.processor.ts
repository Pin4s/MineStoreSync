import { findOrCreatePlayerByNickname, isValidNickname } from "../modules/players/players.service";
import { createPurchase } from "../modules/purchases/purchase.service";
import { webhookSchema } from "../modules/webhooks/webhooks.schema";
import { findWebhookEvents, MAX_ATTEMPTS, registerWebhookFailure, updateWebhookStatus } from "../modules/webhooks/webhooks.service";
import { Status } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { RulesEngineService } from "../modules/rules/rulesEngine.service";
import { logPipeline, logPipelineError } from "../lib/pipeline-log";

const workerLogPrefix = "[WebhookEventsWorker]"

export async function processorWebhookEvent() {

    const rulesEngineService = new RulesEngineService()

    const webhookEvent = await findWebhookEvents()
    if (!webhookEvent) return false
    logPipeline("webhook.selected", { webhookEventId: webhookEvent.id, externalId: webhookEvent.externalId, attempt: webhookEvent.attempts + 1 });

    try {

        const webhook = webhookSchema.parse(webhookEvent.payload)
        logPipeline("webhook.payload_parsed", { webhookEventId: webhookEvent.id });

        const nickname = webhook.data.client_identifier.trim()

        if (!isValidNickname(nickname)) {
            await updateWebhookStatus(Status.FAILED, webhookEvent.id, `Invalid nickname: ${nickname}`)
            logPipeline("webhook.failed_status_saved", { webhookEventId: webhookEvent.id, reason: "invalid_nickname" });
            return true
        }

        const purchase = await prisma.$transaction(async (tx) => {
            const player = await findOrCreatePlayerByNickname(webhook.data.client_identifier, tx)
            logPipeline("player.resolved", { webhookEventId: webhookEvent.id, playerId: player.id });

            const purchase = await createPurchase({
                playerId: player.id,
                webhookEventId: webhookEvent.id,
                externalPurchaseId: webhook.data.internal_id,
                amountCents: Math.round(webhook.data.price * 100),
                purchasedAt: new Date(webhook.data.paid_at ?? webhook.date)
            }, tx)

            logPipeline("purchase.saved", { webhookEventId: webhookEvent.id, playerId: player.id, purchaseId: purchase.id });
            return purchase
        })

        await rulesEngineService.processPurchase(purchase.id)
        logPipeline("rules.completed", { webhookEventId: webhookEvent.id, purchaseId: purchase.id });

        await updateWebhookStatus(Status.PROCESSED, webhookEvent.id)
        logPipeline("webhook.processed", { webhookEventId: webhookEvent.id, purchaseId: purchase.id });

    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : String(error)

        logPipelineError("webhook.processing_failed", error, { webhookEventId: webhookEvent.id });
        const failedEvent = await registerWebhookFailure(webhookEvent, message)

        if (failedEvent.status === Status.FAILED) {
            logPipeline("webhook.failed_status_saved", { webhookEventId: webhookEvent.id, attempt: failedEvent.attempts });
        } else {
            console.info(
                `${workerLogPrefix} Event ${webhookEvent.id} attempt ${failedEvent.attempts}/${MAX_ATTEMPTS} failed, next attempt at ${failedEvent.nextAttemptAt.toISOString()}`
            )
        }

    }

    return true
}
