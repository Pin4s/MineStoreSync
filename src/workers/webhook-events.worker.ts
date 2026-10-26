import { processorWebhookEvent } from "./webhook-events.processor";

const workerLogPrefix = "[WebhookEventsWorker]"

export class WebhookEventsWorker {
    private isRunning = false
    private timer?: ReturnType<typeof setTimeout>;

    public start(): void {
        if (this.isRunning) {
            console.info(`${workerLogPrefix} Worker is already running`)
            return
        }

        this.isRunning = true
        console.info(`${workerLogPrefix} Worker started`)
        void this.poll()
    }

    private async poll(): Promise<void> {
        try {
            console.info(`${workerLogPrefix} Starting polling cycle`)
            let hasEvents = true

            while (this.isRunning && hasEvents) {
                hasEvents = await processorWebhookEvent()
            }

            console.info(`${workerLogPrefix} Polling cycle finished`)

        } catch (error) {
            console.error(`${workerLogPrefix} Polling cycle failed:`, error)

        } finally {
            if (this.isRunning) {
                console.info(`${workerLogPrefix} Next polling cycle scheduled in 5 seconds`)
                this.timer = setTimeout(() => {
                    void this.poll()
                }, 5000)

            }
        }
    }

    public stop() {
        this.isRunning = false
        if (this.timer) clearTimeout(this.timer)
        console.info(`${workerLogPrefix} Worker stopped`)
    }

}
