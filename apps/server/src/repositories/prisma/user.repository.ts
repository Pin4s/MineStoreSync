import type { CreateUserDTO, UserRepository } from "../user.repository";
import { prisma } from "../../lib/prisma";
import type { User } from "../../domain/entities/user";

export class PrismaUserRepository implements UserRepository {

    async create(data: CreateUserDTO) {
        const user = await prisma.user.create({
            data,
        })

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await prisma.user.findFirst({
            where: { email }
        })

        return user
    }

    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { id } })
    }

}
