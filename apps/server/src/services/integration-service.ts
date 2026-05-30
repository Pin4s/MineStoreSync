import { encrypt, decrypt } from "../lib/crypto";
import type { IntegrationRepository } from "../repositories/integrations.repository";

interface SaveIntegrationRequest {
  userId: string;
  rconHost: string;
  rconPort: number;
  rconPassword: string;
  centralCartToken: string;
  webhookSecret?: string;
}

export class IntegrationService {
  constructor(private integrationRepository: IntegrationRepository) {}

  async save(data: SaveIntegrationRequest) {
    const result = await this.integrationRepository.upsert({
      userId: data.userId,
      rconHost: data.rconHost,
      rconPort: data.rconPort,
      rconPasswordEncrypted: encrypt(data.rconPassword),
      centralCartTokenEncrypted: encrypt(data.centralCartToken),
      ...(data.webhookSecret && {
        webhookSecretEncrypted: encrypt(data.webhookSecret),
      }),
    });

    return { webhookToken: result.webhookToken };
  }

  async getStatus(userId: string) {
    const integration = await this.integrationRepository.findByUserId(userId);

    return {
      connected: integration?.hasConfig ?? false,
      hasConfig: integration?.hasConfig ?? false,
      storeName: "CentralCart",
      tokenStatus: integration?.hasCentralCartToken ? "valid" : "missing",
      lastCheckedAt: integration?.updatedAt.toISOString() ?? null,
      rconHost: integration?.rconHost ?? null,
      rconPort: integration?.rconPort ?? null,
      webhookUrl: integration
        ? `${process.env.APP_URL}/webhooks/${integration.webhookToken}`
        : null,
    };
  }

  // uso interno apenas — nunca expor no HTTP
  async getDecryptedCredentials(userId: string) {
    const integration = await this.integrationRepository.findCredentialsByUserId(userId);
    if (!integration) return null;

    return {
      rconHost: integration.rconHost,
      rconPort: integration.rconPort,
      rconPassword: decrypt(integration.rconPasswordEncrypted),
    };
  }
}
