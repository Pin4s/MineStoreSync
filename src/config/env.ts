import 'dotenv/config'
import z from 'zod'

const requiredValue = z.string().trim().min(1)

const envSchema = z.object({
    CENTRALCART_API_KEY: requiredValue,
    MINECRAFT_RCON_KEY: requiredValue,
    DATABASE_URL: requiredValue,
    CENTRALCART_WEBHOOK_SECRET: requiredValue,
    ENVIROMENT: requiredValue,
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
    const missing = result.error.issues.map(issue => issue.path.join('.'))
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
}

export const env = result.data
