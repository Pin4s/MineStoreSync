import z from "zod";
import type { FastifyRequest, FastifyReply } from "fastify";
import { IntegrationService } from "../../../services/integration-service";
import { PrismaIntegrationRepository } from "../../../repositories/prisma/prisma-integration.repository";

export async function saveIntegration(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    rconHost: z.string().min(1),
    rconPort: z.number().int().min(1).max(65535),
    rconPassword: z.string().min(1),
    centralCartToken: z.string().min(1),
    webhookSecret: z.string().min(1).optional(),
  });

  const body = bodySchema.parse(request.body);

  const integrationRepository = new PrismaIntegrationRepository();
  const integrationService = new IntegrationService(integrationRepository);

  const { webhookToken } = await integrationService.save({
    userId: request.user.sub,
    ...body,
  });

  return reply.status(200).send({
    webhookUrl: `${process.env.APP_URL}/webhooks/${webhookToken}`,
  });
}