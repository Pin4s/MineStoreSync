import z from "zod";
import { Prisma } from "../../generated/prisma/client";

export const GOAL_COOLDOWN_MS = 60 * 60 * 1000

const goalCycleSchema = z.object({
    id: z.string(),
    target_cents: z.number().int(),
    started_at: z.date(),
    reached_at: z.date().nullable(),
    cooldown_until: z.date().nullable(),
})

export type GoalCycle = z.infer<typeof goalCycleSchema>

// The current cycle is the most recent one. FOR UPDATE keeps it locked until the transaction
// ends, so two purchases are never evaluated against the same cycle at the same time.
export async function lockCurrentGoalCycle(tx: Prisma.TransactionClient): Promise<GoalCycle | undefined> {
    const rows = await tx.$queryRaw`
        SELECT id, target_cents, started_at, reached_at, cooldown_until
        FROM goal_cycles
        ORDER BY started_at DESC, created_at DESC
        LIMIT 1
        FOR UPDATE
    `

    return z.array(goalCycleSchema).parse(rows)[0]
}

export async function createGoalCycle(startedAt: Date, targetCents: number, tx: Prisma.TransactionClient): Promise<GoalCycle> {
    const cycle = await tx.goalCycles.create({
        data: { startedAt, targetCents },
    })

    return {
        id: cycle.id,
        target_cents: cycle.targetCents,
        started_at: cycle.startedAt,
        reached_at: cycle.reachedAt,
        cooldown_until: cycle.cooldownUntil,
    }
}

export async function findFirstPurchaseDate(tx: Prisma.TransactionClient): Promise<Date | null> {
    const result = await tx.purchases.aggregate({ _min: { purchasedAt: true } })
    return result._min.purchasedAt
}

export async function sumGoalCycle(cycle: GoalCycle, tx: Prisma.TransactionClient): Promise<number> {
    const result = await tx.purchases.aggregate({
        _sum: { amountCents: true },
        where: { purchasedAt: { gte: cycle.started_at, lte: cycle.reached_at ?? undefined } },
    })

    return result._sum.amountCents ?? 0
}

export async function markGoalCycleReached(cycleId: string, reachedAt: Date, tx: Prisma.TransactionClient) {
    return tx.goalCycles.update({
        where: { id: cycleId },
        data: {
            reachedAt,
            cooldownUntil: new Date(reachedAt.getTime() + GOAL_COOLDOWN_MS),
        },
    })
}
