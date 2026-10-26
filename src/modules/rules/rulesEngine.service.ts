import { prisma } from "../../lib/prisma";

export class RulesEngineService {
    public async processPurchase(purchase_id: string) {
        const purchase = await prisma.purchases.findUnique({
            where: { id: purchase_id },
        })

        if (!purchase) {
            throw new Error("Compra não encontrada");
        }

        console.log("Processing purchase with ID:", purchase_id);

        const periodKey = await this.getPeriodKey(purchase.purchasedAt);

        console.log("Period key:", periodKey);

        const dedupeKey = `FIRST_PURCHASE:${purchase.playerId}:${periodKey}`;

        const existingBonus = await prisma.triggerExecutions.findUnique({
            where: { dedupeKey }
        });

        if (existingBonus) {
            console.log("Bonus already exists for this player and period. Skipping bonus creation.");
            return purchase;
        }

        const trigger_executions = await prisma.triggerExecutions.create({
            data: {
                triggerKey: "FIRST_PURCHASE",
                playerId: purchase.playerId,
                purchaseId: purchase.id,
                periodKey,
                dedupeKey,
            }
        })

        console.log("Bônus já existe?", !!existingBonus);
        console.log("Trigger execution created:", trigger_executions);

        return purchase;

    }

    private async getPeriodKey(date: Date) {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Sao_Paulo",
            year: "numeric",
            month: "2-digit"
        }).formatToParts(date);

        const year = parts.find(p => p.type === "year")!.value;
        const month = parts.find(p => p.type === "month")!.value;

        const periodKey = `${year}-${month}`;

        return periodKey;
    }
}