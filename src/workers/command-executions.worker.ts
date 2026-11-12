import { processorCommandExecution } from "./command-executions.processor";
import { RconConfig } from "../lib/rcon";
import { logPipeline, logPipelineError } from "../lib/pipeline-log";

const POLL_INTERVAL_MS = 5000

export class CommandExecutionsWorker {
    private isRunning = false
    private timer?: ReturnType<typeof setTimeout>;

    constructor(private readonly rconConfig: RconConfig) { }

    public start(): void {
        if (this.isRunning) return

        this.isRunning = true
        logPipeline("commands.worker_started");
        void this.poll()
    }

    private async poll(): Promise<void> {
        try {
            let hasCommands = true

            while (this.isRunning && hasCommands) {
                hasCommands = await processorCommandExecution(this.rconConfig)
            }
        } catch (error) {
            logPipelineError("commands.worker_poll_failed", error)
        } finally {
            if (this.isRunning) {
                this.timer = setTimeout(() => {
                    void this.poll()
                }, POLL_INTERVAL_MS)
            }
        }
    }

    public stop() {
        this.isRunning = false
        if (this.timer) clearTimeout(this.timer)
        logPipeline("commands.worker_stopped");
    }
}
