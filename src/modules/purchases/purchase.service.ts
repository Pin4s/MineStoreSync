import { prisma } from "../../lib/prisma"
import { purchaseSchema } from "./purchase.schema"

export async function createPurchase(input = {}) {
    const purchase = purchaseSchema.parse(input)

    return prisma.purchases.upsert({
        where: { externalId: purchase.externalPurchaseId },
        update: {},
        create: {
            playerId: purchase.playerId,
            amountCents: purchase.amountCents,
            webhookEventId: purchase.webhookEventId,
            externalId: purchase.externalPurchaseId,
            purchasedAt: purchase.purchasedAt
        }
    })
}
