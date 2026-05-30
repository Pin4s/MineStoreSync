/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHmac } from "crypto";
import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../../lib/prisma";
import { decrypt } from "../../../lib/crypto";
import { AutomationEngineService } from "../../../services/automation-engine-service";

const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000; // 5 minutos

export async function centralCartWebhook(request: FastifyRequest, reply: FastifyReply) {
  const { webhookToken } = request.params as { webhookToken: string };

  const integration = await prisma.integration.findUnique({
    where: { webhookToken },
  });

  if (!integration || !integration.webhookSecretEncrypted) {
    return reply.status(401).send({ message: "Unauthorized." });
  }

  const timestamp = request.headers["x-centralcart-timestamp"] as string;
  const signature = request.headers["x-centralcart-signature"] as string;

  if (!timestamp || !signature) {
    return reply.status(401).send({ message: "Missing security headers." });
  }

  const tsMs = Number(timestamp) * 1000;
  if (Math.abs(Date.now() - tsMs) > TIMESTAMP_TOLERANCE_MS) {
    return reply.status(401).send({ message: "Timestamp expired." });
  }

  const secret = decrypt(integration.webhookSecretEncrypted);
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${JSON.stringify(request.body)}`)
    .digest("hex");

  if (signature !== expected) {
    return reply.status(401).send({ message: "Invalid signature." });
  }

  reply.status(200).send({ received: true });

  const { event, data } = request.body as { event: string; data: any };

  if (event === "ORDER_APPROVED") {
    const engine = new AutomationEngineService();
    await engine.processOrderApproved(integration.userId, data);
  }
}