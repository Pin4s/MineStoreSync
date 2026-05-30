import z from "zod";
import type { FastifyRequest, FastifyReply } from "fastify";
import { AutomationService } from "../../../services/automation-service";
import { PrismaAutomationRepository } from "../../../repositories/prisma/prisma-automation.repository";

export async function toggleAutomation(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ id: z.string() });
  const bodySchema = z.object({ active: z.boolean() });

  const { id } = paramsSchema.parse(request.params);
  const { active } = bodySchema.parse(request.body);

  const repository = new PrismaAutomationRepository();
  const service = new AutomationService(repository);

  try {
    const automation = await service.toggle(id, request.user.sub, active);
    return reply.status(200).send({ automation });
  } catch {
    return reply.status(404).send({ message: "Automation not found." });
  }
}