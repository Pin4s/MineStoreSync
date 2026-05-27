import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import Fastify from "fastify";

import { env } from "./env";

export const app = Fastify({
  logger: true
});

app.register(cors);
app.register(jwt, {
  secret: env.JWT_SECRET
});

app.get("/health", async () => {
  return { status: "ok" };
});
