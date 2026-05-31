import z from "zod";
import type { FastifyRequest, FastifyReply } from "fastify";
import { IntegrationService } from "../../../services/integration-service";
import { PrismaIntegrationRepository } from "../../../repositories/prisma/prisma-integration.repository";

export async function updateWebhookSecret(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    webhookSecret: z.string().min(1),
  });

  const { webhookSecret } = bodySchema.parse(request.body);

  const integrationRepository = new PrismaIntegrationRepository();
  const integrationService = new IntegrationService(integrationRepository);

  await integrationService.updateWebhookSecret(request.user.sub, webhookSecret);

  return reply.status(204).send();
}
