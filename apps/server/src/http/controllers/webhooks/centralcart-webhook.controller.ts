/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHmac } from "crypto";
import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../../lib/prisma";
import { decrypt } from "../../../lib/crypto";
import { AutomationEngineService } from "../../../services/automation-engine-service";

const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000; // 5 minutos

interface OrderApprovedData {
    price: number;
    client_identifier: string;
    client_name: string;
    packages: Array<{
        package_id: number;
        name: string;
        quantity: number;
    }>;
}

export async function centralCartWebhook(request: FastifyRequest, reply: FastifyReply) {
    const { webhookToken } = request.params as { webhookToken: string };

    // LOG TEMPORARIO - remover depois
    console.log("HEADERS COMPLETOS:", JSON.stringify(request.headers, null, 2));
    console.log("RAW BODY:", request.rawBody);

    // TEMPORARIO: aceita tudo para capturar dados reais
    return reply.status(200).send({ received: true });

    const integration = await prisma.integration.findUnique({
        where: { webhookToken },
    });

    if (!integration || !integration.webhookSecretEncrypted) {
        return reply.status(401).send({ message: "Unauthorized." });
    }

    const timestamp = request.headers["x-centralcart-timestamp"] as string;
    const signature = request.headers["x-centralcart-signature"] as string;

    // LOG TEMPORÁRIO — remover depois
    console.log("=== WEBHOOK RECEBIDO ===")
    console.log("timestamp raw:", timestamp)
    console.log("timestamp como número:", Number(timestamp))
    console.log("timestamp * 1000:", Number(timestamp) * 1000)
    console.log("Date.now():", Date.now())
    console.log("signature:", signature)
    console.log("body raw:", request.rawBody)
    console.log("========================")

    if (!timestamp || !signature) {
        return reply.status(401).send({ message: "Missing security headers." });
    }

    const tsMs = Number(timestamp) * 1000;
    if (Math.abs(Date.now() - tsMs) > TIMESTAMP_TOLERANCE_MS) {
        return reply.status(401).send({ message: "Timestamp expired." });
    }

    const secret = decrypt(integration.webhookSecretEncrypted);
    const expected = createHmac("sha256", secret)
        .update(`${timestamp}.${request.rawBody}`)
        .digest("hex");

    // LOG TEMPORARIO - remover depois
    console.log("secret descriptografado:", secret);
    console.log("string assinada:", `${timestamp}.${request.rawBody}`);
    console.log("expected:", expected);
    console.log("received:", signature);
    console.log("batem?", signature === expected);

    if (signature !== expected) {
        return reply.status(401).send({ message: "Invalid signature." });
    }


    const { event, data } = request.body as { event: string; data: OrderApprovedData };

    if (event === "ORDER_APPROVED") {
        const engine = new AutomationEngineService();
        await engine.processOrderApproved(integration.userId, data);
    }

    reply.status(200).send({ received: true });
}
