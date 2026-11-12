import { prisma } from "../../lib/prisma";
import { TriggerCommandsService } from "../triggersCommands/triggersCommands.service";
import { TriggersExecutionsService } from "../triggersExecutions/triggersExecutions.service";
import { logPipeline } from "../../lib/pipeline-log";

export class RulesEngineService {

    //this turn in chaos, i'll refactor this later, but for now, this is the simplest way to do it

    public async processPurchase(purchase_id: string) {
        logPipeline("rules.started", { purchaseId: purchase_id });
        const triggersExecutionsService = new TriggersExecutionsService()

        const purchase = await prisma.purchases.findUnique({
            where: { id: purchase_id },
        })

        if (!purchase) {
            logPipeline("rules.purchase_missing", { purchaseId: purchase_id });
            throw new Error("Compra não encontrada");
        }

        const periodKey = await this.getPeriodKey(purchase.purchasedAt);
        logPipeline("rules.period_resolved", { purchaseId: purchase.id, playerId: purchase.playerId, periodKey });

        const triggerExecution = await triggersExecutionsService.saveTriggerExecution({
            playerId: purchase.playerId,
            periodKey,
            purchaseId: purchase.id
        });

        if (triggerExecution) {
            const { triggerKey, id } = triggerExecution;

            const triggerCommandsService = new TriggerCommandsService()

            const commandCount = await triggerCommandsService.generateCommandExecutions(triggerKey, id)
            logPipeline("rules.commands_ready", { purchaseId: purchase.id, triggerExecutionId: id, commandCount });
        }

        return purchase;

    }

    private getPeriodKey(date: Date) {
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