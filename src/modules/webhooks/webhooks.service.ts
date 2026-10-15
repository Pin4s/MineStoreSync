import { prisma } from "../../lib/prisma";


interface webhookSchema {
    id: string
    event: string
     date: string
    data: object
}

export async function saveWebhook() {
   
}