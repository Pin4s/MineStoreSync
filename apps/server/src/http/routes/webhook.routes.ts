import type { FastifyInstance } from "fastify";
import { centralCartWebhook } from "../controllers/webhooks/centralcart-webhook.controller";

export function webhookRoutes(app: FastifyInstance) {
    app.post("/:webhookToken", centralCartWebhook);
}