import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { startFakeRcon } from "../fake-rcon";
import { closedPort, closeHarness, RCON_PASSWORD, resetDatabase } from "./harness";
import { Check, scenarios } from "./scenarios";

interface ScenarioReport {
    id: string
    title: string
    input: string
    expected: string
    obtained: string
    passed: boolean
    logs: string[]
}

const format = (value: unknown) => typeof value === "string" ? value : JSON.stringify(value)

function judge(checks: Check[]) {
    return {
        expected: checks.map(([label, expected]) => `${label}: ${format(expected)}`).join("; "),
        obtained: checks.map(([label, , actual]) => `${label}: ${format(actual)}`).join("; "),
        passed: checks.every(([, expected, actual]) => format(expected) === format(actual)),
    }
}

// The system logs every pipeline step. Those lines are kept per scenario and only shown on failure.
async function withCapturedLogs<T>(logs: string[], action: () => Promise<T>): Promise<T> {
    const original = { log: console.log, info: console.info, warn: console.warn, error: console.error }
    const capture = (...args: unknown[]) => { logs.push(args.map(String).join(" ")) }
    console.log = capture
    console.info = capture
    console.warn = capture
    console.error = capture
    try {
        return await action()
    } finally {
        Object.assign(console, original)
    }
}

const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ")

function markdownReport(reports: ScenarioReport[], databaseHost: string) {
    const passed = reports.filter(report => report.passed).length
    const lines = [
        "# Relatório dos cenários de teste",
        "",
        `Gerado em ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} (America/Sao_Paulo), banco em \`${databaseHost}\`.`,
        `Resultado: **${passed} de ${reports.length} cenários passaram.**`,
        "",
        "| Cenário | Entrada | Resultado esperado | Resultado obtido | Status |",
        "|---|---|---|---|---|",
        ...reports.map(report =>
            `| ${report.id} — ${cell(report.title)} | ${cell(report.input)} | ${cell(report.expected)} | ${cell(report.obtained)} | ${report.passed ? "PASSOU" : "FALHOU"} |`
        ),
        "",
    ]
    return lines.join("\n")
}

export async function runScenarios(databaseHost: string): Promise<boolean> {
    const rcon = await startFakeRcon(RCON_PASSWORD)
    const context = {
        rcon,
        rconConfig: { host: "127.0.0.1", port: rcon.port, password: RCON_PASSWORD },
        unavailableRcon: { host: "127.0.0.1", port: await closedPort(), password: RCON_PASSWORD },
    }

    const reports: ScenarioReport[] = []

    try {
        for (const scenario of scenarios) {
            await resetDatabase()
            rcon.received.length = 0
            const logs: string[] = []

            let result: { expected: string, obtained: string, passed: boolean }
            try {
                result = judge(await withCapturedLogs(logs, () => scenario.run(context)))
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error)
                result = { expected: "(cenário não terminou)", obtained: `erro: ${message}`, passed: false }
            }

            reports.push({ ...scenario, ...result, logs })

            console.log(`\n${result.passed ? "PASSOU" : "FALHOU"}  ${scenario.id} — ${scenario.title}`)
            console.log(`  entrada:  ${scenario.input}`)
            console.log(`  esperado: ${result.expected}`)
            console.log(`  obtido:   ${result.obtained}`)
            if (!result.passed) {
                console.log("  últimas linhas de log do sistema:")
                for (const line of logs.slice(-20)) console.log(`    ${line}`)
            }
        }
    } finally {
        await resetDatabase()
        await rcon.close()
        await closeHarness()
    }

    const reportPath = join(__dirname, "report.md")
    writeFileSync(reportPath, markdownReport(reports, databaseHost), "utf8")

    const passed = reports.filter(report => report.passed).length
    console.log(`\n${passed}/${reports.length} cenários passaram. Relatório: ${reportPath}`)
    for (const report of reports) console.log(`  ${report.passed ? "PASSOU" : "FALHOU"}  ${report.id}  ${report.title}`)

    return passed === reports.length
}
