import { prisma } from "../../lib/prisma";
import { logPipeline } from "../../lib/pipeline-log";

export interface TriggerExecutionSchema {
    playerId: string;
    periodKey: string;
    purchaseId: string;
}

export class TriggersExecutionsService {
    async saveTriggerExecution({ playerId, periodKey, purchaseId }: TriggerExecutionSchema) {
        const dedupeKey = `FIRST_PURCHASE:${playerId}:${periodKey}`;

        const existingBonus = await prisma.triggerExecutions.findUnique({
            where: { dedupeKey }
        });

        if (existingBonus) {
            logPipeline("trigger.duplicate_found", { purchaseId, playerId, periodKey, triggerExecutionId: existingBonus.id });
            return;
        }

        const triggerExecutions = await prisma.triggerExecutions.create({
            data: {
                triggerKey: "FIRST_PURCHASE",
                playerId,
                purchaseId,
                periodKey,
                dedupeKey,
            }
        })

        logPipeline("trigger.saved", { purchaseId, playerId, periodKey, triggerExecutionId: triggerExecutions.id });
        return triggerExecutions
    }
}