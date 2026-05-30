import z from "zod";
import type { FastifyRequest, FastifyReply } from "fastify";
import { AutomationService } from "../../../services/automation-service";
import { PrismaAutomationRepository } from "../../../repositories/prisma/prisma-automation.repository";

export async function deleteAutomation(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ id: z.string() });
  const { id } = paramsSchema.parse(request.params);

  const repository = new PrismaAutomationRepository();
  const service = new AutomationService(repository);

  try {
    await service.remove(id, request.user.sub);
    return reply.status(204).send();
  } catch {
    return reply.status(404).send({ message: "Automation not found." });
  }
}