import type { AutomationRepository, CreateAutomationDTO } from "../repositories/automation.repository";

export class AutomationService {
  constructor(private automationRepository: AutomationRepository) {}

  async create(data: CreateAutomationDTO) {
    return this.automationRepository.create(data);
  }

  async listByUser(userId: string) {
    return this.automationRepository.findAllByUserId(userId);
  }

  async toggle(id: string, userId: string, active: boolean) {
    const automation = await this.automationRepository.findById(id);

    if (!automation || automation.userId !== userId) {
      throw new Error("Automation not found.");
    }

    return this.automationRepository.toggleActive(id, active);
  }

  async remove(id: string, userId: string) {
    const automation = await this.automationRepository.findById(id);

    if (!automation || automation.userId !== userId) {
      throw new Error("Automation not found.");
    }

    await this.automationRepository.delete(id);
  }
}