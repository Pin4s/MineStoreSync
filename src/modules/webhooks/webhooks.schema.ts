import { z } from "zod";
import { centralCartWebhookConfig } from "../../config/central-cart";

export const webhookSchema = z.object({
  id: z.string().min(1),
  event: z.enum(["ORDER_APPROVED", "ORDER_CREATED"]),
  date: z.iso.datetime({ offset: true }),
  data: z.looseObject({
    client_identifier: z.string().trim().min(1),
    internal_id: z.string().min(1),
    price: z.number().finite().nonnegative().max(21474836.47),
    paid_at: z.iso.datetime({ offset: true }).nullish(),
    status: z.string().nullish()
  })
}).superRefine((webhook, context) => {
  const isOrderApproved = webhook.event === "ORDER_APPROVED"
  const isApprovedOrderCreated = centralCartWebhookConfig.allowOrderCreatedWithApprovedStatus
    && webhook.event === "ORDER_CREATED"
    && webhook.data.status === "APPROVED"

  if (!isOrderApproved && !isApprovedOrderCreated) {
    context.addIssue({
      code: "custom",
      path: ["event"],
      message: "Webhook must be ORDER_APPROVED or an approved ORDER_CREATED"
    })
  }
});
