import z from 'zod'

const envSchema = z.object({
    CENTRALCART_API_KEY: z.string()
})

const env =  envSchema.parse(process.env)

export { env }