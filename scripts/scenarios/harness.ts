// Helpers that drive the real system code: the Fastify app (through inject), the webhook and
// command processors, and Prisma for setup and assertions.
import { createHmac } from "node:crypto";
import { createServer } from "node:net";
import z from "zod";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { RconConfig } from "../../src/lib/rcon";
import { processorWebhookEvent } from "../../src/workers/webhook-events.processor";
import { processorCommandExecution } from "../../src/workers/command-executions.processor";

export const TEST_SECRET = "scenario-test-secret"
export const RCON_PASSWORD = "scenario-rcon-pass"
export const GOAL_TARGET_CENTS = 10000

export const COMMANDS = {
    FIRST_PURCHASE: "give {player} diamond 1",
    GOAL_REACHED: "say Meta batida!",
    TOP_BUYER: "give {player} nether_star 1",
}

export interface OrderInput {
    id: string
    nick: string
    price: number
    paidAt: string
    event?: string
}

export function orderBody({ id, nick, price, paidAt, event = "ORDER_APPROVED" }: OrderInput): string {
    return JSON.stringify({
        id,
        event,
        date: paidAt,
        data: { client_identifier: nick, internal_id: `order-${id}`, price, paid_at: paidAt },
    })
}

// Same scheme as the system: HMAC-SHA256 hex of `${timestamp}.${raw body}`.
export function sign(rawBody: string, timestamp: string, secret = TEST_SECRET): string {
    return createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex")
}

export function nowTimestamp(): string {
    return String(Math.floor(Date.now() / 1000))
}

const responseSchema = z.object({ message: z.string() })

export interface WebhookResponse {
    status: number
    message: string
}

// Sends `rawBody` exactly as given. Without `signature`, it is signed correctly.
export async function postWebhook(rawBody: string, options: { signature?: string, timestamp?: string } = {}): Promise<WebhookResponse> {
    const timestamp = options.timestamp ?? nowTimestamp()
    const signature = options.signature ?? sign(rawBody, timestamp)

    const response = await app.inject({
        method: "POST",
        url: "/webhooks/central-cart",
        headers: {
            "content-type": "application/json",
            "x-centralcart-timestamp": timestamp,
            "x-centralcart-signature": signature,
        },
        payload: rawBody,
    })

    const parsed = responseSchema.safeParse(response.json())
    return { status: response.statusCode, message: parsed.success ? parsed.data.message : response.body }
}

export async function postOrder(order: OrderInput) {
    return postWebhook(orderBody(order))
}

export async function processWebhooks() {
    while (await processorWebhookEvent()) { /* drain the queue */ }
}

export async function sendCommands(rconConfig: RconConfig) {
    while (await processorCommandExecution(rconConfig)) { /* drain the queue */ }
}

export async function resetDatabase() {
    await prisma.$executeRaw`
        TRUNCATE command_executions, trigger_executions, purchases, players, webhook_events, trigger_commands, goal_cycles CASCADE
    `
    await prisma.triggerCommands.createMany({
        data: Object.entries(COMMANDS).map(([triggerKey, command]) => ({ triggerKey, sortOrder: 1, command })),
    })
}

// A port that was free a moment ago: connecting to it is refused, like an RCON server that is down.
export function closedPort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = createServer()
        server.once("error", reject)
        server.listen(0, "127.0.0.1", () => {
            const address = server.address()
            const port = typeof address === "object" && address !== null ? address.port : 0
            server.close(() => resolve(port))
        })
    })
}

export async function closeHarness() {
    await app.close()
    await prisma.$disconnect()
}
