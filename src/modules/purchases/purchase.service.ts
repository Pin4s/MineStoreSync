import { Prisma } from "../../generated/prisma/browser"
import { prisma } from "../../lib/prisma"
import { purchaseSchema } from "./purchase.schema"

export async function createPurchase(input = {}, db: Prisma.TransactionClient = prisma) {
    const purchase = purchaseSchema.parse(input)

    return db.purchases.upsert({
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
