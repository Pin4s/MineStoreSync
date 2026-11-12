import z from "zod";
import { Prisma } from "../../generated/prisma/client";
import { Status } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

export const TOP_BUYER = "TOP_BUYER"

export function topBuyerDedupeKey(periodKey: string) {
    return `${TOP_BUYER}:${periodKey}`
}

const monthWinnerSchema = z.object({
    player_id: z.string(),
    nickname: z.string(),
    total_cents: z.number().int(),
    last_purchase_id: z.string(),
    last_purchase_at: z.date(),
})

export type MonthWinner = z.infer<typeof monthWinnerSchema>

export async function isMonthClosed(periodKey: string) {
    const execution = await prisma.triggerExecutions.findUnique({
        where: { dedupeKey: topBuyerDedupeKey(periodKey) },
        select: { id: true },
    })

    return execution !== null
}

export async function countPendingWebhookEvents() {
    return prisma.webhookEvents.count({ where: { status: Status.RECEIVED } })
}

// Month = from 00:00 of day 1 to 00:00 of the next day 1, both in São Paulo.
// Highest total wins; on a tie, the player whose LAST purchase of the month is the oldest
// reached that total first.
export async function findMonthWinner(periodKey: string, tx: Prisma.TransactionClient): Promise<MonthWinner | undefined> {
    const rows = await tx.$queryRaw`
        WITH month AS (
            SELECT
                to_date(${periodKey}, 'YYYY-MM')::timestamp AT TIME ZONE 'America/Sao_Paulo' AS start_at,
                (to_date(${periodKey}, 'YYYY-MM') + interval '1 month')::timestamp AT TIME ZONE 'America/Sao_Paulo' AS end_at
        )
        SELECT
            p.player_id,
            pl.nickname,
            SUM(p.amount_cents)::int AS total_cents,
            (array_agg(p.id ORDER BY p.purchased_at DESC))[1] AS last_purchase_id,
            MAX(p.purchased_at) AS last_purchase_at
        FROM purchases p
        JOIN players pl ON pl.id = p.player_id
        CROSS JOIN month
        WHERE p.purchased_at >= month.start_at
          AND p.purchased_at < month.end_at
        GROUP BY p.player_id, pl.nickname
        ORDER BY total_cents DESC, last_purchase_at ASC, p.player_id ASC
        LIMIT 1
    `

    return z.array(monthWinnerSchema).parse(rows)[0]
}
