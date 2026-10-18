import { prisma } from "../../lib/prisma";

export async function findOrCreatePlayerByNickname(playernickname: string) {

    let player = await prisma.player.findUnique({
        where: { nickname: playernickname }
    })

    if (!player) {
        player = await prisma.player.create({
            data: { nickname: playernickname }
        })

    }

    return player
}