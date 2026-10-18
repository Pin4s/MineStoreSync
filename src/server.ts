import { app } from "./app"
import { WebhookEventsWorker } from "./workers/webhook-events.worker"

const port = Number(process.env.PORT) || 3333
const worker = new WebhookEventsWorker()

app.listen({ port, host: '0.0.0.0' }, (err, address) => {
    console.log(`Server is running on ${address}`)
    if (err) {
        app.log.error(err)
    }
})

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


worker.start()
