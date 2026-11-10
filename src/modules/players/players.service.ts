import { Prisma } from "../../generated/prisma/browser";
import { prisma } from "../../lib/prisma";

export async function findOrCreatePlayerByNickname(playernickname = "", db: Prisma.TransactionClient = prisma) {
    return db.player.upsert({
        where: { nickname: playernickname },
        update: {},
        create: { nickname: playernickname }
    })
}
