// Safety lock: the scenarios TRUNCATE every table, so they only run against a local database.
// This file must not import any project module: src/config/env.ts loads .env through dotenv,
// which would silently fill DATABASE_URL with the hosted URL if it were missing here.
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"])

export function assertLocalDatabase(): string {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
        throw new Error(
            "DATABASE_URL não está definido no ambiente. Exporte a URL do Postgres LOCAL antes de rodar " +
            "(o .env não é usado como alternativa, de propósito)."
        )
    }

    let hostname: string
    try {
        hostname = new URL(databaseUrl).hostname
    } catch {
        throw new Error("DATABASE_URL não é uma URL válida. Abortando sem tocar em nenhum banco.")
    }

    if (!LOCAL_HOSTS.has(hostname)) {
        throw new Error(
            `DATABASE_URL aponta para "${hostname}", que não é local. Os cenários apagam todas as tabelas; ` +
            "abortando sem tocar no banco."
        )
    }

    return hostname
}
