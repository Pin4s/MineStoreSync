import { prisma } from "../../lib/prisma";
import type { AutomationRepository, CreateAutomationDTO } from "../automation.repository";

export class PrismaAutomationRepository implements AutomationRepository {
  async create(data: CreateAutomationDTO) {
    return prisma.automation.create({ data });
  }

  async findAllByUserId(userId: string) {
    return prisma.automation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.automation.findUnique({ where: { id } });
  }

  async toggleActive(id: string, active: boolean) {
    return prisma.automation.update({
      where: { id },
      data: { active },
    });
  }

  async delete(id: string) {
    await prisma.automation.delete({ where: { id } });
  }
}