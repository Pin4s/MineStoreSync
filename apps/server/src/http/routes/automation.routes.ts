import type { FastifyInstance } from "fastify";
import { verifyJWT } from "../middlewares/verify-jwt";
import { createAutomation } from "../controllers/automations/create-automation.controller";
import { listAutomations } from "../controllers/automations/list-automations.controller";
import { toggleAutomation } from "../controllers/automations/toggle-automation.controller";
import { deleteAutomation } from "../controllers/automations/delete-automation.controller";

export function automationRoutes(app: FastifyInstance) {
  app.addHook("onRequest", verifyJWT);

  app.post("/", createAutomation);
  app.get("/", listAutomations);
  app.patch("/:id/toggle", toggleAutomation);
  app.delete("/:id", deleteAutomation);
}