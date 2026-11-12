import { closePreviousMonth } from "./top-buyer.processor";
import { logPipeline, logPipelineError } from "../lib/pipeline-log";

const CHECK_INTERVAL_MS = 60_000

export class TopBuyerWorker {
    private isRunning = false
    private timer?: ReturnType<typeof setTimeout>;
    // A month without purchases is never closed, so it would be found again every minute.
    private emptyPeriodLogged?: string

    public start(): void {
        if (this.isRunning) return

        this.isRunning = true
        logPipeline("top_buyer.worker_started");
        void this.check()
    }

    private async check(): Promise<void> {
        try {
            const { periodKey, result } = await closePreviousMonth(new Date())

            if (result === "empty" && this.emptyPeriodLogged !== periodKey) {
                logPipeline("top_buyer.empty", { periodKey });
                this.emptyPeriodLogged = periodKey
            }
        } catch (error) {
            logPipelineError("top_buyer.check_failed", error)
        } finally {
            if (this.isRunning) {
                this.timer = setTimeout(() => {
                    void this.check()
                }, CHECK_INTERVAL_MS)
            }
        }
    }

    public stop() {
        this.isRunning = false
        if (this.timer) clearTimeout(this.timer)
        logPipeline("top_buyer.worker_stopped");
    }
}
