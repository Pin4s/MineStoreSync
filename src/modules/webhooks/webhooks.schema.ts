import { z } from "zod";

export const webhookSchema = z.object({
  id: z.string().min(1),
  event: z.string().min(1),
  date: z.iso.datetime({ offset: true }),
  data: z.looseObject({
    client_identifier: z.string(),
    price: z.number(),
    internal_id: z.string(),
  })
});