import { prisma } from "../lib/prisma";
import { decrypt } from "../lib/crypto";
import { executeRconCommand } from "../lib/rcon";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ConditionType, type Automation, type Integration } from "@prisma/client";

interface OrderData {
  price: number;
  client_identifier: string;
  packages: Array<{
    package_id: number;
    name: string;
    quantity: number;
  }>;
}

type RconCredentials = {
  host: string;
  port: number;
  password: string;
};

export class AutomationEngineService {
  async processOrderApproved(userId: string, data: OrderData) {
    const [automations, integration] = await Promise.all([
      prisma.automation.findMany({ where: { userId, active: true } }),
      prisma.integration.findUnique({ where: { userId } }),
    ]);

    if (!integration) return;

    const credentials: RconCredentials = {
      host: integration.rconHost,
      port: integration.rconPort,
      password: decrypt(integration.rconPasswordEncrypted),
    };

    for (const automation of automations) {
      try {
        await this.process(automation, data, credentials, userId);
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

  private async process(
    automation: Automation,
    data: OrderData,
    credentials: RconCredentials,
    userId: string
  ) {
    switch (automation.conditionType) {
      case ConditionType.SALES_GOAL:
        return this.handleAccumulatedGoal(automation, data.price, credentials);

      case ConditionType.MONTHLY_REVENUE_GOAL:
        return this.handlePeriodGoal(automation, data.price, "month", credentials);

      case ConditionType.DAILY_REVENUE_GOAL:
        return this.handlePeriodGoal(automation, data.price, "day", credentials);

      case ConditionType.FIRST_SALE_OF_DAY:
        return this.handleFirstSaleOfDay(automation, data, credentials);

      case ConditionType.PRODUCT_SALES_GOAL:
        return this.handleProductSalesGoal(automation, data, credentials);

      case ConditionType.NEW_BUYER:
        return this.handleNewBuyer(automation, data, credentials, userId);

      case ConditionType.HIGH_VALUE_ORDER:
        return this.handleHighValueOrder(automation, data, credentials);
    }
  }

  // ─── Helpers ──────────────────────────────────────────────

  private buildCommand(command: string, player: string): string {
    return command.replace(/{player}/g, player);
  }

  private async executeAndLog(
    automation: Automation,
    command: string,
    credentials: RconCredentials
  ) {
    await executeRconCommand(credentials.host, credentials.port, credentials.password, command);

    await prisma.automationLog.create({
      data: {
        automationId: automation.id,
        commandExecuted: command,
        success: true,
      },
    });

    await prisma.automation.update({
      where: { id: automation.id },
      data: { lastTriggeredAt: new Date() },
    });
  }

  // ─── Handlers ─────────────────────────────────────────────

  private async handleAccumulatedGoal(
    automation: Automation,
    price: number,
    credentials: RconCredentials
  ) {
    const condition = automation.conditionValue as { goal: number };
    const current = Number(automation.currentValue ?? 0);
    const newValue = current + price;

    await prisma.automation.update({
      where: { id: automation.id },
      data: { currentValue: newValue },
    });

    if (current < condition.goal && newValue >= condition.goal) {
      await this.executeAndLog(automation, automation.command, credentials);
    }
  }

  private async handlePeriodGoal(
    automation: Automation,
    price: number,
    period: "month" | "day",
    credentials: RconCredentials
  ) {
    const condition = automation.conditionValue as { goal: number };
    const now = new Date();
    const periodStart = automation.periodStart ? new Date(automation.periodStart) : null;

    const isNewPeriod =
      !periodStart ||
      (period === "month"
        ? periodStart.getMonth() !== now.getMonth() ||
          periodStart.getFullYear() !== now.getFullYear()
        : periodStart.toDateString() !== now.toDateString());

    const current = isNewPeriod ? 0 : Number(automation.currentValue ?? 0);
    const newValue = current + price;

    await prisma.automation.update({
      where: { id: automation.id },
      data: {
        currentValue: newValue,
        ...(isNewPeriod && { periodStart: now }),
      },
    });

    if (current < condition.goal && newValue >= condition.goal) {
      await this.executeAndLog(automation, automation.command, credentials);
    }
  }

  private async handleFirstSaleOfDay(
    automation: Automation,
    data: OrderData,
    credentials: RconCredentials
  ) {
    const now = new Date();
    const lastTriggered = automation.lastTriggeredAt
      ? new Date(automation.lastTriggeredAt)
      : null;

    const alreadyFiredToday =
      lastTriggered && lastTriggered.toDateString() === now.toDateString();

    if (!alreadyFiredToday) {
      const command = this.buildCommand(automation.command, data.client_identifier);
      await this.executeAndLog(automation, command, credentials);
    }
  }

  private async handleProductSalesGoal(
    automation: Automation,
    data: OrderData,
    credentials: RconCredentials
  ) {
    const condition = automation.conditionValue as { packageId: number; goal: number };

    const match = data.packages.find((p) => p.package_id === condition.packageId);
    if (!match) return;

    const current = Number(automation.currentValue ?? 0);
    const newValue = current + match.quantity;

    await prisma.automation.update({
      where: { id: automation.id },
      data: { currentValue: newValue },
    });

    if (current < condition.goal && newValue >= condition.goal) {
      const command = this.buildCommand(automation.command, data.client_identifier);
      await this.executeAndLog(automation, command, credentials);
    }
  }

  private async handleNewBuyer(
    automation: Automation,
    data: OrderData,
    credentials: RconCredentials,
    userId: string
  ) {
    const existing = await prisma.knownBuyer.findUnique({
      where: {
        userId_clientIdentifier: {
          userId,
          clientIdentifier: data.client_identifier,
        },
      },
    });

    if (existing) return;

    await prisma.knownBuyer.create({
      data: { userId, clientIdentifier: data.client_identifier },
    });

    const command = this.buildCommand(automation.command, data.client_identifier);
    await this.executeAndLog(automation, command, credentials);
  }

  private async handleHighValueOrder(
    automation: Automation,
    data: OrderData,
    credentials: RconCredentials
  ) {
    const condition = automation.conditionValue as { minValue: number };

    if (data.price >= condition.minValue) {
      const command = this.buildCommand(automation.command, data.client_identifier);
      await this.executeAndLog(automation, command, credentials);
    }
  }
}