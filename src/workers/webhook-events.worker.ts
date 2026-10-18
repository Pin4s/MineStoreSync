import { prisma } from "../lib/prisma";

export class WebhookEventsWorker {
    private isRunning = false
    private timer?: ReturnType<typeof setTimeout>;

    public start(): void {
        if (this.isRunning) return

        this.isRunning = true
        this.poll()
    }

    private async poll() {
        const webhookCounts = await prisma.webhookEvents.count({
            where: { status: 'RECEIVED' }
        })

        if (webhookCounts >= 1) {
            console.log('Unprocesseds webhook_events: ', webhookCounts)
        }

        if (this.isRunning) {
            this.timer = setTimeout(() => {
                void this.poll()
            }, 5000)
        }
    }

    public stop() {
        this.isRunning = false
        clearTimeout(this.timer)
    }

}
