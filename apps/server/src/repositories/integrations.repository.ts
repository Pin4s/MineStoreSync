export interface CreateIntegrationDTO {
  userId: string;
  rconHost: string;
  rconPort: number;
  rconPasswordEncrypted: string;
  centralCartTokenEncrypted: string;
  webhookSecretEncrypted?: string;
}

export interface IntegrationCredentials {
  rconHost: string;
  rconPort: number;
  rconPasswordEncrypted: string;
  webhookSecretEncrypted: string | null;
  webhookToken: string;
}

export interface IntegrationRepository {
  upsert(data: CreateIntegrationDTO): Promise<{ webhookToken: string }>;
  findByUserId(userId: string): Promise<{
    rconHost: string;
    rconPort: number;
    hasConfig: boolean;
    webhookToken: string;
    updatedAt: Date;
    hasCentralCartToken: boolean;
  } | null>;
  findCredentialsByUserId(userId: string): Promise<IntegrationCredentials | null>;
  findByWebhookToken(token: string): Promise<(IntegrationCredentials & { userId: string }) | null>;
}
