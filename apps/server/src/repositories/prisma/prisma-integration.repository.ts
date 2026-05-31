import { prisma } from "../../lib/prisma";
import type {
  CreateIntegrationDTO,
  IntegrationCredentials,
  IntegrationRepository,
} from "../integrations.repository";

export class PrismaIntegrationRepository implements IntegrationRepository {
  async upsert(data: CreateIntegrationDTO): Promise<{ webhookToken: string }> {
    const integration = await prisma.integration.upsert({
      where: { userId: data.userId },
      update: {
        rconHost: data.rconHost,
        rconPort: data.rconPort,
        rconPasswordEncrypted: data.rconPasswordEncrypted,
        centralCartTokenEncrypted: data.centralCartTokenEncrypted,
        ...(data.webhookSecretEncrypted && {
          webhookSecretEncrypted: data.webhookSecretEncrypted,
        }),
      },
      create: data,
      select: { webhookToken: true },
    });

    return { webhookToken: integration.webhookToken };
  }

  async updateWebhookSecret(userId: string, webhookSecretEncrypted: string): Promise<void> {
    await prisma.integration.update({
      where: { userId },
      data: { webhookSecretEncrypted },
    });
  }

  async findByUserId(userId: string) {
    const integration = await prisma.integration.findUnique({
      where: { userId },
      select: {
        rconHost: true,
        rconPort: true,
        webhookToken: true,
        updatedAt: true,
        centralCartTokenEncrypted: true,
      },
    });

    if (!integration) return null;

    return {
      ...integration,
      hasConfig: true,
      hasCentralCartToken: Boolean(integration.centralCartTokenEncrypted),
    };
  }

  async findCredentialsByUserId(userId: string): Promise<IntegrationCredentials | null> {
    return prisma.integration.findUnique({
      where: { userId },
      select: {
        rconHost: true,
        rconPort: true,
        rconPasswordEncrypted: true,
        webhookSecretEncrypted: true,
        webhookToken: true,
      },
    });
  }

  async findByWebhookToken(token: string) {
    return prisma.integration.findUnique({
      where: { webhookToken: token },
      select: {
        userId: true,
        rconHost: true,
        rconPort: true,
        rconPasswordEncrypted: true,
        webhookSecretEncrypted: true,
        webhookToken: true,
      },
    });
  }
}
