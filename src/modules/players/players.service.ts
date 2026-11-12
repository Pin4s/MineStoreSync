import { Prisma } from "../../generated/prisma/browser";
import { prisma } from "../../lib/prisma";

export async function findOrCreatePlayerByNickname(playernickname = "", db: Prisma.TransactionClient = prisma) {
    const normalized = playernickname.toLowerCase()
    return db.player.upsert({
        where: { nickname: normalized },
        update: {},
        create: { nickname: normalized }
    })
}

const NICKNAME_REGEX = /^[A-Za-z0-9_]{3,16}$/

export function isValidNickname(nickname: string) {
    return NICKNAME_REGEX.test(nickname)
}