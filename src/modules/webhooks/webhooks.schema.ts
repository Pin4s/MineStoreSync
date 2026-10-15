import z from 'zod'


export const webhookSchema = z.object({
    id: z.string().min(1),
    event: z.string().min(1),
    date: z.iso.datetime({ offset: true }),
    data: z.record(z.string(), z.unknown())
})

