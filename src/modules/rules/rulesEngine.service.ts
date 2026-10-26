import { prisma } from "../../lib/prisma";
import { TriggerCommandsService } from "../triggersCommands/triggersCommands.service";
import { TriggersExecutionsService } from "../triggersExecutions/triggersExecutions.service";

export class RulesEngineService {

    //this turn in chaos, i'll refactor this later, but for now, this is the simplest way to do it

    public async processPurchase(purchase_id: string) {
        const triggersExecutionsService = new TriggersExecutionsService()

        const purchase = await prisma.purchases.findUnique({
            where: { id: purchase_id },
        })

        if (!purchase) {
            throw new Error("Compra não encontrada");
        }
        console.log("Processing purchase with ID:", purchase_id);

        const periodKey = await this.getPeriodKey(purchase.purchasedAt);
        console.log("Period key:", periodKey);


        await triggersExecutionsService.saveTriggerExecution({
            playerId: purchase.playerId,
            periodKey,
            purchaseId: purchase.id
        });

        const triggercommand = new TriggerCommandsService()
        triggercommand.executeComand()

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