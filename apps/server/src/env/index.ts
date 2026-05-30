import 'dotenv/config';
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().min(1).default("dev").default('dev'),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required").default('secret'),
  ENCRYPTION_KEY: z.string().length(64),
  APP_URL: z.string().url(),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required").default("postgresql://admin:admin@localhost:5432/mydb?schema=public"),
  PORT: z.coerce.number().int().positive().default(3333)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map(({ path, message }) => `${path.join(".") || "environment"}: ${message}`)
    .join("\n");

  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env = parsedEnv.data;
