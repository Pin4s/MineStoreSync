import 'dotenv/config'
import z from 'zod'

const requiredValue = z.string().trim().min(1)
const port = z.coerce.number().int().min(1).max(65535)

const envSchema = z.object({
    DATABASE_URL: requiredValue,
    CENTRALCART_WEBHOOK_SECRET: requiredValue,
    ENVIRONMENT: requiredValue,
    PORT: port.default(3333),
    RCON_HOST: requiredValue.optional(),
    RCON_PORT: port.optional(),
    RCON_PASSWORD: requiredValue.optional(),
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
    const problems = result.error.issues.map(issue => `- ${issue.path.join('.')}: ${issue.message}`)
    console.error(`Invalid environment variables:\n${problems.join('\n')}`)
    process.exit(1)
}

export const env = result.data
