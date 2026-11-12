import { prisma } from "../lib/prisma";
import { logPipeline } from "../lib/pipeline-log";
import { previousPeriodKey } from "../lib/period";
import { countPendingWebhookEvents, findMonthWinner, isMonthClosed, TOP_BUYER, topBuyerDedupeKey } from "../modules/topBuyer/topBuyer.service";
import { TriggersExecutionsService } from "../modules/triggersExecutions/triggersExecutions.service";
import { TriggerCommandsService } from "../modules/triggersCommands/triggersCommands.service";

export type MonthCloseResult = "already_closed" | "deferred" | "empty" | "closed"

// Rule 3: closes the month before `now` (São Paulo) once, as soon as it is safe to do so.
export async function closePreviousMonth(now: Date): Promise<{ periodKey: string, result: MonthCloseResult }> {
    const periodKey = previousPeriodKey(now)

    if (await isMonthClosed(periodKey)) return { periodKey, result: "already_closed" }

    const pendingCount = await countPendingWebhookEvents()
    if (pendingCount > 0) {
        logPipeline("top_buyer.deferred", { periodKey, pendingCount });
        return { periodKey, result: "deferred" }
    }

    return prisma.$transaction(async (tx) => {
        const winner = await findMonthWinner(periodKey, tx)
        if (!winner) return { periodKey, result: "empty" }

        const triggerExecution = await new TriggersExecutionsService().saveTriggerExecution({
            triggerKey: TOP_BUYER,
            dedupeKey: topBuyerDedupeKey(periodKey),
            periodKey,
            playerId: winner.player_id,
            purchaseId: winner.last_purchase_id,
        }, tx)

        if (!triggerExecution) return { periodKey, result: "already_closed" }

        const commandCount = await new TriggerCommandsService().generateCommandExecutions(TOP_BUYER, triggerExecution.id, winner.nickname, tx)
        logPipeline("top_buyer.closed", {
            periodKey,
            playerId: winner.player_id,
            nickname: winner.nickname,
            totalCents: winner.total_cents,
            triggerExecutionId: triggerExecution.id,
            commandCount,
        });

        return { periodKey, result: "closed" }
    })
}
