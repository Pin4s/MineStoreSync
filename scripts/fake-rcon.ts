// Test tool: a minimal Source RCON server that records every command it receives.
// Standalone: npx tsx scripts/fake-rcon.ts <port> <password>
import { createServer, Server } from "node:net";

const AUTH = 3
const EXEC_COMMAND = 2
const AUTH_RESPONSE = 2
const RESPONSE_VALUE = 0

export interface FakeRcon {
    port: number
    received: string[]
    close: () => Promise<void>
}

function encodePacket(id: number, type: number, body: string) {
    const payload = Buffer.from(body, "utf8")
    const packet = Buffer.alloc(payload.length + 14)
    packet.writeInt32LE(payload.length + 10, 0)
    packet.writeInt32LE(id, 4)
    packet.writeInt32LE(type, 8)
    payload.copy(packet, 12)
    return packet
}

function listen(server: Server, port: number) {
    return new Promise<number>((resolve, reject) => {
        server.once("error", reject)
        server.listen(port, "127.0.0.1", () => {
            const address = server.address()
            resolve(typeof address === "object" && address !== null ? address.port : port)
        })
    })
}

// port 0 picks a free port.
export async function startFakeRcon(password: string, port = 0): Promise<FakeRcon> {
    const received: string[] = []

    const server = createServer(socket => {
        let pending = Buffer.alloc(0)
        let authenticated = false

        socket.on("error", () => undefined)
        socket.on("data", chunk => {
            pending = Buffer.concat([pending, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)])

            while (pending.length >= 4) {
                const size = pending.readInt32LE(0)
                if (pending.length < size + 4) break

                const id = pending.readInt32LE(4)
                const type = pending.readInt32LE(8)
                const body = pending.subarray(12, size + 2).toString("utf8")
                pending = pending.subarray(size + 4)

                if (type === AUTH) {
                    authenticated = body === password
                    socket.write(encodePacket(authenticated ? id : -1, AUTH_RESPONSE, ""))
                } else if (type === EXEC_COMMAND && authenticated) {
                    received.push(body)
                    socket.write(encodePacket(id, RESPONSE_VALUE, `ok: ${body}`))
                }
            }
        })
    })

    const boundPort = await listen(server, port)

    return {
        port: boundPort,
        received,
        close: () => new Promise<void>(resolve => server.close(() => resolve())),
    }
}

if (require.main === module) {
    const port = Number(process.argv[2] ?? 25575)
    const password = process.argv[3] ?? "test-pass"

    void startFakeRcon(password, port).then(rcon => {
        console.log(`[fake-rcon] listening on 127.0.0.1:${rcon.port}`)
        setInterval(() => {
            while (rcon.received.length > 0) console.log(`[fake-rcon] received: ${rcon.received.shift()}`)
        }, 200)
    })
}
