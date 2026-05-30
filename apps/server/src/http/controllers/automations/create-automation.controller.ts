import z from "zod";
import type { FastifyRequest, FastifyReply } from "fastify";
import { ConditionType } from "@prisma/client";
import { AutomationService } from "../../../services/automation-service";
import { PrismaAutomationRepository } from "../../../repositories/prisma/prisma-automation.repository";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const conditionValueSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal(ConditionType.SALES_GOAL), goal: z.number().positive() }),
    z.object({ type: z.literal(ConditionType.MONTHLY_TOP_BUYER) }),
    z.object({ type: z.literal(ConditionType.FIRST_SALE_OF_DAY) }),
]);

export async function createAutomation(request: FastifyRequest, reply: FastifyReply) {
    const bodySchema = z.object({
        name: z.string().min(1),
        conditionType: z.nativeEnum(ConditionType),
        conditionValue: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
        command: z.string().min(1),
    });

    const body = bodySchema.parse(request.body);

    const repository = new PrismaAutomationRepository();
    const service = new AutomationService(repository);

    const automation = await service.create({
        userId: request.user.sub,
        ...body,
    });

    return reply.status(201).send({ automation });
}