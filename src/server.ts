import { env } from "./config/env"
import { app } from "./app"
import { prisma } from "./lib/prisma"
import { WebhookEventsWorker } from "./workers/webhook-events.worker"

const port = env.PORT
const worker = new WebhookEventsWorker()

app.addHook("onClose", async () => {
    worker.stop();
});

async function shutdown() {
    try {
        await app.close();
    } catch (error) {
        app.log.error(error);
        process.exitCode = 1;
    }
}

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());

async function healthCheck(name: string, check: () => Promise<unknown>) {
    try {
        await check()
        console.info(`[Health] ${name}: OK`)
    } catch (error) {
        console.error(`[Health] ${name}: FAIL`, error)
        process.exit(1)
    }
}

async function bootstrap() {
    await healthCheck("DB", () => prisma.$queryRaw`SELECT 1`)
    await healthCheck("API", () => app.listen({ port, host: "0.0.0.0" }))
    await healthCheck("Worker", () => prisma.webhookEvents.findFirst({ select: { id: true } }))

    console.info(`Server is running on port ${port}`)
    worker.start()
}

void bootstrap()
