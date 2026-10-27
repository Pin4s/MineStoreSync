import { findOrCreatePlayerByNickname } from "../modules/players/players.service";
import { webhookSchema } from "../modules/webhooks/webhooks.schema";
import { findWebhookEvents, updateWebhookStatus } from "../modules/webhooks/webhooks.service";

import { Status } from "../generated/prisma/enums";
import { PurchasesService } from "../modules/purchases/purchases.service";
import { RulesEngineService } from "../modules/rules/rulesEngine.service";
import { logPipeline, logPipelineError } from "../lib/pipeline-log";

export async function processorWebhookEvent() {

    const purchasesService = new PurchasesService()
    const rulesEngineService = new RulesEngineService()

    const webhookEvent = await findWebhookEvents()
    if (!webhookEvent) return
    logPipeline("webhook.selected", { webhookEventId: webhookEvent.id, externalId: webhookEvent.externalId, attempt: webhookEvent.attempts + 1 });

    try {
        const webhook = webhookSchema.parse(webhookEvent.payload)
        logPipeline("webhook.payload_parsed", { webhookEventId: webhookEvent.id });

        const {
            date
        } = webhook

        const {
            client_identifier,
            price,
            internal_id
        } = webhook.data

        const player = await findOrCreatePlayerByNickname(client_identifier)
        logPipeline("player.resolved", { webhookEventId: webhookEvent.id, playerId: player.id });

        const purchase = await purchasesService.createPurchase({
            playerId: player.id,
            amount: price,
            webhookEventId: webhookEvent.id,
            externalId: internal_id,
            purchaseDate: date
        })

        logPipeline("purchase.saved", { webhookEventId: webhookEvent.id, playerId: player.id, purchaseId: purchase.id });
        await rulesEngineService.processPurchase(purchase.id)
        logPipeline("rules.completed", { webhookEventId: webhookEvent.id, purchaseId: purchase.id });

        await updateWebhookStatus(
            Status.PROCESSED,
            webhookEvent.id
        )
        logPipeline("webhook.processed", { webhookEventId: webhookEvent.id, purchaseId: purchase.id });



    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : String(error)

        logPipelineError("webhook.processing_failed", error, { webhookEventId: webhookEvent.id });
        await updateWebhookStatus(Status.FAILED, webhookEvent.id, message)
        logPipeline("webhook.failed_status_saved", { webhookEventId: webhookEvent.id });

    }
}
