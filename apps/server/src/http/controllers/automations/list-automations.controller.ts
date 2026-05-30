import type { FastifyRequest, FastifyReply } from "fastify";
import { AutomationService } from "../../../services/automation-service";
import { PrismaAutomationRepository } from "../../../repositories/prisma/prisma-automation.repository";

export async function listAutomations(request: FastifyRequest, reply: FastifyReply) {
  const repository = new PrismaAutomationRepository();
  const service = new AutomationService(repository);

  const automations = await service.listByUser(request.user.sub);

  return reply.status(200).send({ automations });
}