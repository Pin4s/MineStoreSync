import { findOrCreatePlayerByNickname } from "../modules/players/players.service";
import { webhookSchema } from "../modules/webhooks/webhooks.schema";
import { findWebhookEvents, updateWebhookStatus } from "../modules/webhooks/webhooks.service";

import { Status } from "../generated/prisma/enums";
import { PurchasesService } from "../modules/purchases/purchases.service";

export async function processorWebhookEvent() {

    const purchasesService = new PurchasesService()

    const webhookEvent = await findWebhookEvents()
    if (!webhookEvent) return

    try {
        const webhook = webhookSchema.parse(webhookEvent.payload)

        const {
            date
        } = webhook
        
        const {
            client_identifier,
            price,
            internal_id
        } = webhook.data

        const player = await findOrCreatePlayerByNickname(client_identifier)

        await purchasesService.createPurchase({
            playerId: player.id,
            amount: price,
            webhookEventId: webhookEvent.id,
            externalId: internal_id,
            purchaseDate: date
        })

        await updateWebhookStatus(
            Status.PROCESSED,
            webhookEvent.id
        )


    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : String(error)

        await updateWebhookStatus(Status.FAILED, webhookEvent.id, message)

        console.error(`Failed to process webhook event ${webhookEvent.id}:`, error)

    }
}
