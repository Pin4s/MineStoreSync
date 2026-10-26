import { prisma } from "../../lib/prisma";

export class TriggerCommandsService {
    async executeComand() {

        const commands = await prisma.triggerCommands.findMany({
            where: {
                triggerKey: "FIRST_PURCHASE"
            }, orderBy: {
                sortOrder: "asc"
            }
        })

        console.log("Commands:", commands);
    }

}