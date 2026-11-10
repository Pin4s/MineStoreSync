import { z } from "zod";

export const webhookSchema = z.object({
  id: z.string().min(1),
  event: z.literal("ORDER_APPROVED"),
  date: z.iso.datetime({ offset: true }),
  data: z.looseObject({
    client_identifier: z.string().trim().min(1),
    internal_id: z.string().min(1),
    price: z.number().nonnegative().max(21474836.47),
    paid_at: z.iso.datetime({ offset: true }).nullish()
  })
});
