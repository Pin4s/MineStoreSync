import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { logPipeline } from "../../lib/pipeline-log";

export interface TriggerExecutionSchema {
    playerId: string;
    periodKey: string;
    purchaseId: string;
}

export class TriggersExecutionsService {
    async saveTriggerExecution({ playerId, periodKey, purchaseId }: TriggerExecutionSchema, db: Prisma.TransactionClient = prisma) {
        const dedupeKey = `FIRST_PURCHASE:${playerId}:${periodKey}`;

        try {
            const triggerExecutions = await db.triggerExecutions.create({
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
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                logPipeline("trigger.duplicate_found", { purchaseId, playerId, periodKey });
                return;
            }

            throw error;
        }
    }
}
