import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { Prisma } from "../../generated/prisma/client";
import { TriggerCommandsService } from "../triggersCommands/triggersCommands.service";
import { TriggersExecutionsService } from "../triggersExecutions/triggersExecutions.service";
import { createGoalCycle, findFirstPurchaseDate, GoalCycle, lockCurrentGoalCycle, markGoalCycleReached, sumGoalCycle } from "../goalCycles/goalCycles.service";
import { logPipeline } from "../../lib/pipeline-log";
import { getPeriodKey } from "../../lib/period";

const FIRST_PURCHASE = "FIRST_PURCHASE"
const GOAL_REACHED = "GOAL_REACHED"

interface GoalPurchase {
    id: string
    purchasedAt: Date
}

export class RulesEngineService {

    //this turn in chaos, i'll refactor this later, but for now, this is the simplest way to do it

    public async processPurchase(purchase_id: string) {
        logPipeline("rules.started", { purchaseId: purchase_id });
        const triggersExecutionsService = new TriggersExecutionsService()

        const purchase = await prisma.purchases.findUnique({
            where: { id: purchase_id },
            include: { player: true },
        })

        if (!purchase) {
            logPipeline("rules.purchase_missing", { purchaseId: purchase_id });
            throw new Error("Compra não encontrada");
        }

        const periodKey = getPeriodKey(purchase.purchasedAt);
        logPipeline("rules.period_resolved", { purchaseId: purchase.id, playerId: purchase.playerId, periodKey });

        await prisma.$transaction(async (tx) => {
            const triggerExecution = await triggersExecutionsService.saveTriggerExecution({
                triggerKey: FIRST_PURCHASE,
                dedupeKey: `${FIRST_PURCHASE}:${purchase.playerId}:${periodKey}`,
                playerId: purchase.playerId,
                periodKey,
                purchaseId: purchase.id
            }, tx);

            if (triggerExecution) {
                const { triggerKey, id } = triggerExecution;

                const triggerCommandsService = new TriggerCommandsService()

                const commandCount = await triggerCommandsService.generateCommandExecutions(triggerKey, id, purchase.player.nickname, tx)
                logPipeline("rules.commands_ready", { purchaseId: purchase.id, triggerExecutionId: id, commandCount });
            }
        });

        await this.evaluateGoal(purchase);

        return purchase;

    }

    // Rule 2: the cycle stays locked from evaluation until the trigger and its commands are saved.
    private async evaluateGoal(purchase: GoalPurchase) {
        await prisma.$transaction(async (tx) => {
            const cycle = await this.resolveGoalCycle(purchase, tx)
            if (!cycle) return

            const totalCents = await sumGoalCycle(cycle, tx)
            logPipeline("goal.progress", { purchaseId: purchase.id, goalCycleId: cycle.id, totalCents, targetCents: cycle.target_cents });

            if (totalCents < cycle.target_cents) return

            const reached = await markGoalCycleReached(cycle.id, purchase.purchasedAt, tx)
            logPipeline("goal.reached", { purchaseId: purchase.id, goalCycleId: cycle.id, totalCents, cooldownUntil: reached.cooldownUntil?.toISOString() ?? null });

            const triggerExecution = await new TriggersExecutionsService().saveTriggerExecution({
                triggerKey: GOAL_REACHED,
                dedupeKey: `${GOAL_REACHED}:${cycle.id}`,
                periodKey: cycle.id,
                playerId: null,
                purchaseId: purchase.id
            }, tx);

            if (triggerExecution) {
                const commandCount = await new TriggerCommandsService().generateCommandExecutions(GOAL_REACHED, triggerExecution.id, null, tx)
                logPipeline("rules.commands_ready", { purchaseId: purchase.id, triggerExecutionId: triggerExecution.id, commandCount });
            }
        });
    }

    // Returns the cycle this purchase counts for, or undefined when it counts for none.
    private async resolveGoalCycle(purchase: GoalPurchase, tx: Prisma.TransactionClient): Promise<GoalCycle | undefined> {
        const current = await lockCurrentGoalCycle(tx)

        if (!current) {
            const startedAt = await findFirstPurchaseDate(tx) ?? purchase.purchasedAt
            return this.startGoalCycle(startedAt, purchase.id, tx)
        }

        if (current.cooldown_until === null) {
            if (purchase.purchasedAt < current.started_at) {
                logPipeline("goal.purchase_ignored", { purchaseId: purchase.id, goalCycleId: current.id, reason: "outside_cycle" });
                return
            }
            return current
        }

        if (purchase.purchasedAt < current.cooldown_until) {
            const reason = current.reached_at !== null && purchase.purchasedAt >= current.reached_at ? "cooldown" : "outside_cycle"
            logPipeline("goal.purchase_ignored", { purchaseId: purchase.id, goalCycleId: current.id, reason });
            return
        }

        return this.startGoalCycle(current.cooldown_until, purchase.id, tx)
    }

    private async startGoalCycle(startedAt: Date, purchaseId: string, tx: Prisma.TransactionClient) {
        const cycle = await createGoalCycle(startedAt, env.GOAL_TARGET_CENTS, tx)
        logPipeline("goal.cycle_created", { purchaseId, goalCycleId: cycle.id, startedAt: startedAt.toISOString(), targetCents: cycle.target_cents });
        return cycle
    }

}
