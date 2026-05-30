import type { Automation, ConditionType, Prisma } from "@prisma/client";

export interface CreateAutomationDTO {
  userId: string;
  name: string;
  conditionType: ConditionType;
  conditionValue: Prisma.InputJsonValue;
  command: string;
}

export interface AutomationRepository {
  create(data: CreateAutomationDTO): Promise<Automation>;
  findAllByUserId(userId: string): Promise<Automation[]>;
  findById(id: string): Promise<Automation | null>;
  toggleActive(id: string, active: boolean): Promise<Automation>;
  delete(id: string): Promise<void>;
}