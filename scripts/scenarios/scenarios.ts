import { prisma } from "../../src/lib/prisma";
import { RconConfig } from "../../src/lib/rcon";
import { processorCommandExecution } from "../../src/workers/command-executions.processor";
import { closePreviousMonth } from "../../src/workers/top-buyer.processor";
import { FakeRcon } from "../fake-rcon";
import { orderBody, postOrder, postWebhook, processWebhooks, sendCommands, sign, nowTimestamp, COMMANDS } from "./harness";

export type Check = [label: string, expected: unknown, actual: unknown]

export interface ScenarioContext {
    rcon: FakeRcon
    rconConfig: RconConfig
    unavailableRcon: RconConfig
}

export interface Scenario {
    id: string
    title: string
    input: string
    run: (context: ScenarioContext) => Promise<Check[]>
}

const iso = (date: Date | null | undefined) => date?.toISOString() ?? null

async function count(triggerKey?: string) {
    return {
        events: await prisma.webhookEvents.count(),
        purchases: await prisma.purchases.count(),
        triggers: await prisma.triggerExecutions.count({ where: triggerKey ? { triggerKey } : {} }),
        commands: await prisma.commandsExecutions.count({ where: triggerKey ? { triggerExecution: { triggerKey } } : {} }),
    }
}

async function commandsOf(triggerKey: string) {
    const rows = await prisma.commandsExecutions.findMany({
        where: { triggerExecution: { triggerKey } },
        orderBy: { createdAt: "asc" },
    })
    return rows.map(row => row.command)
}

async function goalCycles() {
    return prisma.goalCycles.findMany({ orderBy: { startedAt: "asc" } })
}

async function sumSince(startedAt: Date) {
    const result = await prisma.purchases.aggregate({ _sum: { amountCents: true }, where: { purchasedAt: { gte: startedAt } } })
    return result._sum.amountCents ?? 0
}

// The meta is 10000 cents. Purchases at 10:00, 10:10 and 10:20 (SP) add up to 12000.
async function reachGoal(prefix: string) {
    await postOrder({ id: `${prefix}1`, nick: `${prefix}Ana`, price: 40, paidAt: "2026-11-12T10:00:00-03:00" })
    await postOrder({ id: `${prefix}2`, nick: `${prefix}Bia`, price: 30, paidAt: "2026-11-12T10:10:00-03:00" })
    await postOrder({ id: `${prefix}3`, nick: `${prefix}Caio`, price: 50, paidAt: "2026-11-12T10:20:00-03:00" })
    await processWebhooks()
}

export const scenarios: Scenario[] = [
    {
        id: "C1",
        title: "Compra aprovada",
        input: "ORDER_APPROVED assinado, C1Player, R$ 25,00",
        run: async ({ rcon, rconConfig }) => {
            const response = await postOrder({ id: "c1", nick: "C1Player", price: 25, paidAt: "2026-11-10T12:00:00-03:00" })
            await processWebhooks()
            await sendCommands(rconConfig)

            const event = await prisma.webhookEvents.findUnique({ where: { externalId: "c1" } })
            const purchase = await prisma.purchases.findFirst({ include: { player: true } })
            const command = await prisma.commandsExecutions.findFirst()

            return [
                ["HTTP", 200, response.status],
                ["evento", "PROCESSED", event?.status],
                ["jogador", "c1player", purchase?.player.nickname],
                ["compra (centavos)", 2500, purchase?.amountCents],
                ["comando", "SENT", command?.status],
                ["RCON recebeu", ["give c1player diamond 1"], rcon.received],
            ]
        },
    },
    {
        id: "C2",
        title: "Webhook duplicado",
        input: "O mesmo webhook (mesmo id) enviado 2 vezes",
        run: async () => {
            const body = orderBody({ id: "c2", nick: "C2Player", price: 10, paidAt: "2026-11-10T12:00:00-03:00" })
            const first = await postWebhook(body)
            const second = await postWebhook(body)
            await processWebhooks()
            const totals = await count()

            return [
                ["1º envio", "200 Webhook received", `${first.status} ${first.message}`],
                ["2º envio", "200 Webhook already received", `${second.status} ${second.message}`],
                ["webhook_events", 1, totals.events],
                ["compras", 1, totals.purchases],
            ]
        },
    },
    {
        id: "C3",
        title: "Evento não aprovado ignorado",
        input: "ORDER_CREATED assinado",
        run: async () => {
            const response = await postOrder({ id: "c3", nick: "C3Player", price: 10, paidAt: "2026-11-10T12:00:00-03:00", event: "ORDER_CREATED" })
            await processWebhooks()
            const totals = await count()

            return [
                ["resposta", "200 Webhook ignored", `${response.status} ${response.message}`],
                ["webhook_events", 0, totals.events],
                ["compras", 0, totals.purchases],
            ]
        },
    },
    {
        id: "C4",
        title: "Primeira compra do mês",
        input: "C4Player compra em 10/11/2026",
        run: async () => {
            await postOrder({ id: "c4", nick: "C4Player", price: 10, paidAt: "2026-11-10T12:00:00-03:00" })
            await processWebhooks()
            const trigger = await prisma.triggerExecutions.findFirst({ where: { triggerKey: "FIRST_PURCHASE" } })

            return [
                ["gatilhos FIRST_PURCHASE", 1, await prisma.triggerExecutions.count({ where: { triggerKey: "FIRST_PURCHASE" } })],
                ["período", "2026-11", trigger?.periodKey],
                ["comandos", ["give c4player diamond 1"], await commandsOf("FIRST_PURCHASE")],
            ]
        },
    },
    {
        id: "C5",
        title: "Segunda compra no mês",
        input: "C5Player compra em 03/11 e de novo em 20/11/2026",
        run: async () => {
            await postOrder({ id: "c5a", nick: "C5Player", price: 10, paidAt: "2026-11-03T12:00:00-03:00" })
            await postOrder({ id: "c5b", nick: "C5Player", price: 15, paidAt: "2026-11-20T12:00:00-03:00" })
            await processWebhooks()
            const totals = await count("FIRST_PURCHASE")

            return [
                ["compras", 2, totals.purchases],
                ["gatilhos FIRST_PURCHASE", 1, totals.triggers],
                ["comandos FIRST_PURCHASE", 1, totals.commands],
            ]
        },
    },
    {
        id: "C6",
        title: "Compra às 23:30 SP do último dia",
        input: "C6Player compra em 31/10/2026 23:30 SP (já 01/11 em UTC)",
        run: async () => {
            await postOrder({ id: "c6", nick: "C6Player", price: 10, paidAt: "2026-10-31T23:30:00-03:00" })
            await processWebhooks()
            const purchase = await prisma.purchases.findFirst()
            const trigger = await prisma.triggerExecutions.findFirst({ where: { triggerKey: "FIRST_PURCHASE" } })

            return [
                ["purchased_at (UTC)", "2026-11-01T02:30:00.000Z", iso(purchase?.purchasedAt)],
                ["mês da Regra 1", "2026-10", trigger?.periodKey],
            ]
        },
    },
    {
        id: "C7",
        title: "Meta atingida",
        input: "Meta 10000: R$ 40 + 30 + 50 entre 10:00 e 10:20 SP; depois R$ 30 às 11:30",
        run: async () => {
            await reachGoal("C7")
            const goalCommands = await commandsOf("GOAL_REACHED")
            await postOrder({ id: "c7after", nick: "C7Davi", price: 30, paidAt: "2026-11-12T11:30:00-03:00" })
            await processWebhooks()
            const cycles = await goalCycles()
            const next = cycles[1]

            return [
                ["gatilhos GOAL_REACHED", 1, await prisma.triggerExecutions.count({ where: { triggerKey: "GOAL_REACHED" } })],
                ["comandos globais", [COMMANDS.GOAL_REACHED], goalCommands],
                ["atingida em", "2026-11-12T13:20:00.000Z", iso(cycles[0]?.reachedAt)],
                ["espera até", "2026-11-12T14:20:00.000Z", iso(cycles[0]?.cooldownUntil)],
                ["novo ciclo começa em", "2026-11-12T14:20:00.000Z", iso(next?.startedAt)],
                ["soma do novo ciclo (excedente de 2000 descartado)", 3000, next ? await sumSince(next.startedAt) : null],
            ]
        },
    },
    {
        id: "C8",
        title: "Compra durante a espera da meta",
        input: "Meta batida às 10:20; C8Late compra R$ 90 às 10:50; C8After compra R$ 20 às 11:30",
        run: async () => {
            await reachGoal("C8")
            await postOrder({ id: "c8late", nick: "C8Late", price: 90, paidAt: "2026-11-12T10:50:00-03:00" })
            await processWebhooks()
            const cyclesDuringCooldown = (await goalCycles()).length
            const lateFirstPurchase = await prisma.triggerExecutions.count({ where: { triggerKey: "FIRST_PURCHASE", player: { nickname: "c8late" } } })

            await postOrder({ id: "c8after", nick: "C8After", price: 20, paidAt: "2026-11-12T11:30:00-03:00" })
            await processWebhooks()
            const next = (await goalCycles())[1]

            return [
                ["ciclos após a compra na espera", 1, cyclesDuringCooldown],
                ["gatilhos GOAL_REACHED", 1, await prisma.triggerExecutions.count({ where: { triggerKey: "GOAL_REACHED" } })],
                ["Regra 1 do C8Late", 1, lateFirstPurchase],
                ["soma do novo ciclo (R$ 90 da espera fora)", 2000, next ? await sumSince(next.startedAt) : null],
            ]
        },
    },
    {
        id: "C9",
        title: "Maior comprador com empate",
        input: "Outubro: C9Ana R$ 30 (05/10) + 20 (25/10) e C9Bia R$ 50 (10/10); fechamento simulado em 01/11 00:05 SP, 2 vezes",
        run: async () => {
            await postOrder({ id: "c9a1", nick: "C9Ana", price: 30, paidAt: "2026-10-05T12:00:00-03:00" })
            await postOrder({ id: "c9b1", nick: "C9Bia", price: 50, paidAt: "2026-10-10T12:00:00-03:00" })
            await postOrder({ id: "c9a2", nick: "C9Ana", price: 20, paidAt: "2026-10-25T12:00:00-03:00" })
            await processWebhooks()

            const first = await closePreviousMonth(new Date("2026-11-01T03:05:00Z"))
            const second = await closePreviousMonth(new Date("2026-11-01T03:06:00Z"))
            const winner = await prisma.triggerExecutions.findFirst({ where: { triggerKey: "TOP_BUYER" }, include: { player: true } })

            return [
                ["1º fechamento", "2026-10 closed", `${first.periodKey} ${first.result}`],
                ["2º fechamento", "2026-10 already_closed", `${second.periodKey} ${second.result}`],
                ["vencedor (empate em 5000, chegou primeiro)", "c9bia", winner?.player?.nickname],
                ["comandos TOP_BUYER", ["give c9bia nether_star 1"], await commandsOf("TOP_BUYER")],
            ]
        },
    },
    {
        id: "C10",
        title: "RCON indisponível",
        input: "Comando PENDING e RCON fora do ar; 5 ciclos de envio (espera de 30s adiantada no banco)",
        run: async ({ rcon, unavailableRcon }) => {
            await postOrder({ id: "c10", nick: "C10Player", price: 10, paidAt: "2026-11-10T12:00:00-03:00" })
            await processWebhooks()

            const history: string[] = []
            let firstRetryDelayS: number | null = null

            for (let attempt = 1; attempt <= 5; attempt++) {
                await processorCommandExecution(unavailableRcon)
                const command = await prisma.commandsExecutions.findFirstOrThrow()
                history.push(`${command.attempts}:${command.status}`)

                if (attempt === 1) firstRetryDelayS = Math.round((command.nextAttemptAt.getTime() - Date.now()) / 1000)
                if (command.status === "PENDING") {
                    await prisma.commandsExecutions.update({ where: { id: command.id }, data: { nextAttemptAt: new Date() } })
                }
            }

            const pickedAfterLimit = await processorCommandExecution(unavailableRcon)

            return [
                ["tentativas", "1:PENDING, 2:PENDING, 3:PENDING, 4:PENDING, 5:NEEDS_ACTION", history.join(", ")],
                ["nova tentativa agendada em ~30s", true, firstRetryDelayS !== null && firstRetryDelayS >= 25 && firstRetryDelayS <= 30],
                ["pega de novo depois de NEEDS_ACTION", false, pickedAfterLimit],
                ["RCON recebeu", [], rcon.received],
            ]
        },
    },
    {
        id: "C11",
        title: "Reprocessamento sem duplicar",
        input: "Evento processado e enviado; volta para RECEIVED e é processado e enviado de novo",
        run: async ({ rcon, rconConfig }) => {
            await postOrder({ id: "c11", nick: "C11Player", price: 10, paidAt: "2026-11-10T12:00:00-03:00" })
            await processWebhooks()
            await sendCommands(rconConfig)

            await prisma.webhookEvents.update({ where: { externalId: "c11" }, data: { status: "RECEIVED", nextAttemptAt: new Date() } })
            await processWebhooks()
            await sendCommands(rconConfig)

            const totals = await count()
            const event = await prisma.webhookEvents.findUnique({ where: { externalId: "c11" } })

            return [
                ["evento", "PROCESSED", event?.status],
                ["compras", 1, totals.purchases],
                ["gatilhos", 1, totals.triggers],
                ["comandos", 1, totals.commands],
                ["RCON recebeu", ["give c11player diamond 1"], rcon.received],
            ]
        },
    },
    {
        id: "C12",
        title: "Assinatura inválida",
        input: "ORDER_APPROVED assinado com outro secret",
        run: async () => {
            const body = orderBody({ id: "c12", nick: "C12Player", price: 10, paidAt: "2026-11-10T12:00:00-03:00" })
            const timestamp = nowTimestamp()
            const response = await postWebhook(body, { timestamp, signature: sign(body, timestamp, "wrong-secret") })

            return [
                ["HTTP", 401, response.status],
                ["webhook_events", 0, await prisma.webhookEvents.count()],
            ]
        },
    },
    {
        id: "C13",
        title: "Corpo alterado após assinar",
        input: "Assinado com price 10; enviado com price 1000",
        run: async () => {
            const signedBody = orderBody({ id: "c13", nick: "C13Player", price: 10, paidAt: "2026-11-10T12:00:00-03:00" })
            const sentBody = orderBody({ id: "c13", nick: "C13Player", price: 1000, paidAt: "2026-11-10T12:00:00-03:00" })
            const timestamp = nowTimestamp()
            const response = await postWebhook(sentBody, { timestamp, signature: sign(signedBody, timestamp) })

            return [
                ["HTTP", 401, response.status],
                ["webhook_events", 0, await prisma.webhookEvents.count()],
            ]
        },
    },
]
