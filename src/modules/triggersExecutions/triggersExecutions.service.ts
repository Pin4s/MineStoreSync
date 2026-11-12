import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { logPipeline } from "../../lib/pipeline-log";

export interface TriggerExecutionSchema {
    triggerKey: string;
    dedupeKey: string;
    periodKey: string;
    playerId: string | null;
    purchaseId: string;
}

export class TriggersExecutionsService {
    async saveTriggerExecution({ triggerKey, dedupeKey, periodKey, playerId, purchaseId }: TriggerExecutionSchema, db: Prisma.TransactionClient = prisma) {
        try {
            const triggerExecutions = await db.triggerExecutions.create({
                data: {
                    triggerKey,
                    playerId,
                    purchaseId,
                    periodKey,
                    dedupeKey,
                }
            })

            logPipeline("trigger.saved", { triggerKey, purchaseId, playerId, periodKey, triggerExecutionId: triggerExecutions.id });
            return triggerExecutions
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                logPipeline("trigger.duplicate_found", { triggerKey, purchaseId, playerId, periodKey });
                return;
            }

            throw error;
        }
    }
}
