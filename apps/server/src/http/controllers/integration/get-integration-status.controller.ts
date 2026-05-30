import type { FastifyRequest, FastifyReply } from "fastify";
import { IntegrationService } from "../../../services/integration-service";
import { PrismaIntegrationRepository } from "../../../repositories/prisma/prisma-integration.repository";

export async function getIntegrationStatus(request: FastifyRequest, reply: FastifyReply) {
  const integrationRepository = new PrismaIntegrationRepository();
  const integrationService = new IntegrationService(integrationRepository);

  const status = await integrationService.getStatus(request.user.sub);

  return reply.status(200).send(status);
}