import z from "zod";

export const purchaseSchema = z.object({
    playerId: z.uuid(),
    webhookEventId: z.uuid(),
    externalPurchaseId: z.string().min(1),
    amountCents: z.number().int().nonnegative(),
    purchasedAt: z.date()
})
