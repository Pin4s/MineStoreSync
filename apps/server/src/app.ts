import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import Fastify from "fastify";

import { env } from "./env";
import { userRoutes } from "./http/routes/user.routes";
import { integrationRoutes } from "./http/routes/integration.routes";
import { webhookRoutes } from "./http/routes/webhook.routes";
import { automationRoutes } from "./http/routes/automation.routes";

export const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  },
})

app.register(cors);
app.register(jwt, {
  secret: env.JWT_SECRET
});

app.get("/health", async () => {
  return { status: "ok" };
});

// Registro de rotas 
app.register(userRoutes, { prefix: "/users" })
app.register(integrationRoutes, { prefix: "/integrations" });
app.register(webhookRoutes, { prefix: "/webhooks" });
app.register(automationRoutes, { prefix: "/automations" });