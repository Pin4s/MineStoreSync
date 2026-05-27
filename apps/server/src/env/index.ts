import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().min(1).default("dev"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
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
