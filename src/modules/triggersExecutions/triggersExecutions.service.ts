import { prisma } from "../../lib/prisma";

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
            console.log("Bonus already exists for this player and period. Skipping bonus creation.");
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

        return triggerExecutions
    }
}