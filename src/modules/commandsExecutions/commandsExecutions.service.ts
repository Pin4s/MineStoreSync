import z from "zod";
import { Prisma } from "../../generated/prisma/client";
import { CommandStatus } from "../../generated/prisma/enums";

export const MAX_ATTEMPTS = 5
export const RETRY_DELAY_MS = 30_000

const pendingCommandSchema = z.object({
    id: z.string(),
    trigger_execution_id: z.string(),
    sort_order: z.number().int(),
    command: z.string(),
    attempts: z.number().int(),
})

export type PendingCommand = z.infer<typeof pendingCommandSchema>

// Locks the next sendable command until the transaction ends. SKIP LOCKED makes a concurrent
// cycle ignore it, and NOT EXISTS keeps sort_order: a command only goes out after every earlier
// command of the same trigger execution was sent or resolved manually.
export async function lockNextPendingCommand(tx: Prisma.TransactionClient): Promise<PendingCommand | undefined> {
    const rows = await tx.$queryRaw`
        SELECT c.id, c.trigger_execution_id, c.sort_order, c.command, c.attempts
        FROM command_executions c
        WHERE c.status = 'PENDING'
          AND (c.next_attempt_at IS NULL OR c.next_attempt_at <= now())
          AND NOT EXISTS (
              SELECT 1 FROM command_executions previous
              WHERE previous.trigger_execution_id = c.trigger_execution_id
                AND previous.sort_order < c.sort_order
                AND previous.status IN ('PENDING', 'NEEDS_ACTION')
          )
        ORDER BY c.next_attempt_at ASC, c.sort_order ASC
        LIMIT 1
        FOR UPDATE OF c SKIP LOCKED
    `

    return z.array(pendingCommandSchema).parse(rows)[0]
}

export async function markCommandSent(commandId: string, response: string, tx: Prisma.TransactionClient) {
    return tx.commandsExecutions.update({
        where: { id: commandId },
        data: {
            status: CommandStatus.SENT,
            sentAt: new Date(),
            lastResponse: response,
        },
    })
}

export async function registerCommandFailure(command: PendingCommand, message: string, tx: Prisma.TransactionClient) {
    const attempts = command.attempts + 1
    const reachedLimit = attempts >= MAX_ATTEMPTS

    return tx.commandsExecutions.update({
        where: { id: command.id },
        data: {
            attempts,
            lastResponse: message,
            status: reachedLimit ? CommandStatus.NEEDS_ACTION : CommandStatus.PENDING,
            nextAttemptAt: reachedLimit ? undefined : new Date(Date.now() + RETRY_DELAY_MS),
        },
    })
}
