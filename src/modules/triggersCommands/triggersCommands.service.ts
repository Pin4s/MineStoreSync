import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { logPipeline } from "../../lib/pipeline-log";

export class TriggerCommandsService {
    async generateCommandExecutions(triggerKey: string, triggerExecutionId: string, db: Prisma.TransactionClient = prisma) {

        const commands = await db.triggerCommands.findMany({
            where: {
                triggerKey,
            }, orderBy: {
                sortOrder: "asc"
            }
        })

        logPipeline("commands.templates_loaded", { triggerExecutionId, triggerKey, count: commands.length });

        for (const command of commands) {
            const execution = await db.commandsExecutions.create({
                data: {
                    triggerExecutionId,
                    sortOrder: command.sortOrder,
                    command: command.command,
                    status: "PENDING",
                }
            });
            logPipeline("commands.execution_saved", { triggerExecutionId, commandExecutionId: execution.id, sortOrder: command.sortOrder });
        }

        logPipeline("commands.queued", { triggerExecutionId, count: commands.length });
        return commands.length;
    }

}