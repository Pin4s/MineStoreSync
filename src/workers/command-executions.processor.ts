import { prisma } from "../lib/prisma";
import { RconConfig, sendRconCommand } from "../lib/rcon";
import { logPipeline, logPipelineError } from "../lib/pipeline-log";
import { CommandStatus } from "../generated/prisma/enums";
import { lockNextPendingCommand, markCommandSent, MAX_ATTEMPTS, registerCommandFailure } from "../modules/commandsExecutions/commandsExecutions.service";

// The row lock lives as long as the transaction, so it must outlast the RCON timeout.
const TRANSACTION_TIMEOUT_MS = 30_000

export async function processorCommandExecution(rconConfig: RconConfig): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
        const command = await lockNextPendingCommand(tx)
        if (!command) return false

        const context = {
            commandExecutionId: command.id,
            triggerExecutionId: command.trigger_execution_id,
            sortOrder: command.sort_order,
            attempt: command.attempts + 1,
        }
        logPipeline("command.selected", context);

        let response: string
        try {
            response = await sendRconCommand(rconConfig, command.command)
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            logPipelineError("command.send_failed", error, context);

            const failed = await registerCommandFailure(command, message, tx)

            if (failed.status === CommandStatus.NEEDS_ACTION) {
                logPipeline("command.needs_action", { ...context, maxAttempts: MAX_ATTEMPTS });
            } else {
                logPipeline("command.retry_scheduled", { ...context, nextAttemptAt: failed.nextAttemptAt.toISOString() });
            }
            return true
        }

        await markCommandSent(command.id, response, tx)
        logPipeline("command.sent", context);
        return true
    }, { timeout: TRANSACTION_TIMEOUT_MS })
}
