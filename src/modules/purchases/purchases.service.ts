import { prisma } from "../../lib/prisma"
import { Purchase } from "./purchase.schema"

export class PurchasesService {

    convertToCentets(amount: number): number {
        return Math.round(amount * 100)
    }

    async createPurchase({ playerId, amount, webhookEventId, externalId, purchaseDate }: Purchase) {
        const purchase = await prisma.purchases.create({
            data: {
                playerId,
                amountCents: this.convertToCentets(amount),
                webhookEventId,
                externalId,
                purchasedAt: new Date(purchaseDate)
            }
        })

        return purchase
    }
}