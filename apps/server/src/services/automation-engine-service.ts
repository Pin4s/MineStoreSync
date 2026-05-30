/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../lib/prisma";
import { decrypt } from "../lib/crypto";
import { executeRconCommand } from "../lib/rcon";
import { ConditionType } from "@prisma/client";

interface OrderApprovedData {
  total: number;         // valor do pedido — confirme o campo exato na doc da CentralCart
  customer: {
    username?: string;   // nick do Minecraft — campo customizado do checkout
  };
}

export class AutomationEngineService {
  async processOrderApproved(userId: string, data: OrderApprovedData) {
    const automations = await prisma.automation.findMany({
      where: { userId, active: true },
    });

    const integration = await prisma.integration.findUnique({
      where: { userId },
    });

    if (!integration) return;

    const rconPassword = decrypt(integration.rconPasswordEncrypted);

    for (const automation of automations) {
      try {
        if (automation.conditionType === ConditionType.SALES_GOAL) {
          await this.handleSalesGoal(automation, data, integration, rconPassword);
        }
      } catch (error) {
        await prisma.automationLog.create({
          data: {
            automationId: automation.id,
            commandExecuted: automation.command,
            success: false,
            errorMessage: error instanceof Error ? error.message : "Erro desconhecido",
          },
        });
      }
    }
  }

  private async handleSalesGoal(
    automation: any,
    data: OrderApprovedData,
    integration: any,
    rconPassword: string
  ) {
    const condition = automation.conditionValue as { goal: number };
    const currentValue = Number(automation.currentValue ?? 0);
    const newValue = currentValue + data.total;

    await prisma.automation.update({
      where: { id: automation.id },
      data: { currentValue: newValue },
    });

    // meta ainda não batida antes, mas bateu agora
    if (currentValue < condition.goal && newValue >= condition.goal) {
      const command = automation.command.replace(
        "{player}",
        data.customer.username ?? ""
      );

      const response = await executeRconCommand(
        integration.rconHost,
        integration.rconPort,
        rconPassword,
        command
      );

      if(!response){
        return console.log('godamn')
      }

      await prisma.automationLog.create({
        data: {
          automationId: automation.id,
          commandExecuted: command,
          success: true,
          errorMessage: null,
        },
      });

      await prisma.automation.update({
        where: { id: automation.id },
        data: { lastTriggeredAt: new Date() },
      });
    }
  }
}