import { findOrCreatePlayerByNickname } from "../modules/players/players.service";
import { webhookSchema } from "../modules/webhooks/webhooks.schema";
import { findWebhookEvents, updateWebhookStatus } from "../modules/webhooks/webhooks.service";

import { Status } from "../generated/prisma/enums";

export async function processorWebhookEvent() {

    const webhookEvent = await findWebhookEvents()
    if (!webhookEvent) return

    try {
        const webhook = webhookSchema.parse(webhookEvent.payload)
        const { client_identifier } = webhook.data

        await findOrCreatePlayerByNickname(client_identifier)

        await updateWebhookStatus(Status.PROCESSED, webhookEvent.id)

    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : String(error)

        await updateWebhookStatus(Status.FAILED, webhookEvent.id, message)
        console.error(`Failed to process webhook event ${webhookEvent.id}:`, error)

    }
}
