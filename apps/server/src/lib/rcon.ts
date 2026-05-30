import { Rcon } from "rcon-client";

export async function executeRconCommand(
  host: string,
  port: number,
  password: string,
  command: string
): Promise<string> {
  const rcon = new Rcon({ host, port, password, timeout: 5000 });

  try {
    await rcon.connect();
    const response = await rcon.send(command);
    return response;
  } finally {
    await rcon.end().catch(() => {}); // garante que fecha mesmo com erro
  }
}