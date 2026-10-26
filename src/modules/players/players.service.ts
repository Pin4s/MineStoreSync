import { prisma } from "../../lib/prisma";

export async function findOrCreatePlayerByNickname(playernickname = "") {
    return prisma.player.upsert({
        where: { nickname: playernickname },
        update: {},
        create: { nickname: playernickname }
    })
}
