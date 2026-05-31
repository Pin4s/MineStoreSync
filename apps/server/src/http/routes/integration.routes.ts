import type { FastifyInstance } from "fastify";
import { verifyJWT } from "../middlewares/verify-jwt";
import { saveIntegration } from "../controllers/integration/save-integration.controller";
import { getIntegrationStatus } from "../controllers/integration/get-integration-status.controller";
import { updateWebhookSecret } from "../controllers/integration/update-webhook-secret.controller";

export function integrationRoutes(app: FastifyInstance) {
  app.addHook("onRequest", verifyJWT);

  app.post("/", saveIntegration);
  app.get("/status", getIntegrationStatus);
  app.patch("/webhook-secret", updateWebhookSecret);
}
