import { processorWebhookEvent } from "./webhook-events.processor";

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

            await processorWebhookEvent()

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
