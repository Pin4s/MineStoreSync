import type { FastifyInstance } from "fastify";
import { verifyJWT } from "../middlewares/verify-jwt";
import { saveIntegration } from "../controllers/integration/save-integration.controller";
import { getIntegrationStatus } from "../controllers/integration/get-integration-status.controller";

export function integrationRoutes(app: FastifyInstance) {
  app.addHook("onRequest", verifyJWT);

  app.post("/", saveIntegration);
  app.get("/status", getIntegrationStatus);
}