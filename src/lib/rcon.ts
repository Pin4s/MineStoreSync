import { Rcon } from "rcon-client"
import { env } from "../config/env"
import { logPipelineError } from "./pipeline-log"

const RCON_TIMEOUT_MS = 5000

export interface RconConfig {
    host: string
    port: number
    password: string
}

export function getRconConfig(): RconConfig | null {
    const { RCON_HOST, RCON_PORT, RCON_PASSWORD } = env

    if (!RCON_HOST || !RCON_PORT || !RCON_PASSWORD) return null

    return { host: RCON_HOST, port: RCON_PORT, password: RCON_PASSWORD }
}

export async function sendRconCommand(config: RconConfig, command: string): Promise<string> {
    const rcon = new Rcon({ ...config, timeout: RCON_TIMEOUT_MS })

    // Without a listener, a socket error emitted after connect would crash the process.
    rcon.on("error", error => logPipelineError("rcon.connection_error", error))

    await rcon.connect()

    try {
        return await rcon.send(command)
    } finally {
        await rcon.end().catch(() => undefined)
    }
}
