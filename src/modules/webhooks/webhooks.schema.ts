import z, { unknown } from 'zod'

//thats is whats come from request
export const webhookSchema = z.object({
    id: z.string().min(1),
    event: z.string().min(1),
    date: z.iso.datetime({ offset: true }),
    data: z.object(unknown) //i need to save "data" as payload
})

