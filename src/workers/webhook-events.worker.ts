import { prisma } from "../lib/prisma";
import { findOrCreatePlayerByNickname } from "../modules/players/players.service";
import { webhookSchema } from "../modules/webhooks/webhooks.schema";

export class WebhookEventsWorker {
    private isRunning = false
    private timer?: ReturnType<typeof setTimeout>;

    public start(): void {
        if (this.isRunning) return

        this.isRunning = true
        void this.poll()
    }

    private async poll(): Promise<void> {
        try {
            
            const webhookEvent = await prisma.webhookEvents.findFirst({
                where: { status: 'RECEIVED' },
                orderBy: { createdAt: 'asc' }
            })

            if (!webhookEvent) return
            
            try {
                const webhook = webhookSchema.parse(webhookEvent.payload)
                const { client_identifier } = webhook.data

                await findOrCreatePlayerByNickname(client_identifier)

                //this part will be a function in the webhook service
                await prisma.webhookEvents.update({
                    where: { id: webhookEvent.id },
                    data: {
                        status: 'PROCESSED',
                        attempts: { increment: 1 },
                        lastError: null,
                        processedAt: new Date()
                    }
                })
            } catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : String(error)

                // this part too
                await prisma.webhookEvents.update({
                    where: { id: webhookEvent.id },
                    data: {
                        status: 'FAILED',
                        attempts: { increment: 1 },
                        lastError: message
                    }
                })

                console.error(`Failed to process webhook event ${webhookEvent.id}:`, error)
            }
        } catch (error) {
            console.error('Webhook worker polling failed:', error)
        } finally {
            if (this.isRunning) {
                this.timer = setTimeout(() => {
                    void this.poll()
                }, 5000)
            }
        }
    }

    public stop() {
        this.isRunning = false
        if (this.timer) clearTimeout(this.timer)
    }

}
