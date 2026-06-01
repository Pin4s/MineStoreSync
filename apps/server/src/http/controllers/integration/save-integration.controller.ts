import z from "zod";
import type { FastifyRequest, FastifyReply } from "fastify";
import { encrypt } from "../../../lib/crypto";
import { prisma } from "../../../lib/prisma";

export async function saveIntegration(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    rconHost: z.string().min(1).optional(),
    rconPort: z.number().int().min(1).max(65535).optional(),
    rconPassword: z.string().min(1).optional(),
    centralCartToken: z.string().min(1).optional(),
  }).refine(
    (body) =>
      body.rconHost !== undefined ||
      body.rconPort !== undefined ||
      body.rconPassword !== undefined ||
      body.centralCartToken !== undefined,
    { message: "At least one integration field must be provided." }
  );

  const body = bodySchema.parse(request.body);
  const existingIntegration = await prisma.integration.findUnique({
    where: { userId: request.user.sub },
    select: { webhookToken: true },
  });

  if (!existingIntegration) {
    const integration = await prisma.integration.create({
      data: {
        userId: request.user.sub,
        rconHost: body.rconHost ?? "",
        rconPort: body.rconPort ?? 25575,
        rconPasswordEncrypted: encrypt(body.rconPassword ?? ""),
        centralCartTokenEncrypted: encrypt(body.centralCartToken ?? ""),
      },
      select: { webhookToken: true },
    });

    return reply.status(200).send({
      webhookUrl: `${process.env.APP_URL}/webhooks/${integration.webhookToken}`,
    });
  }

  const integration = await prisma.integration.update({
    where: { userId: request.user.sub },
    data: {
      ...(body.rconHost !== undefined && { rconHost: body.rconHost }),
      ...(body.rconPort !== undefined && { rconPort: body.rconPort }),
      ...(body.rconPassword !== undefined && { rconPasswordEncrypted: encrypt(body.rconPassword) }),
      ...(body.centralCartToken !== undefined && {
        centralCartTokenEncrypted: encrypt(body.centralCartToken),
      }),
    },
    select: { webhookToken: true },
  });

  return reply.status(200).send({
    webhookUrl: `${process.env.APP_URL}/webhooks/${integration.webhookToken}`,
  });
}
