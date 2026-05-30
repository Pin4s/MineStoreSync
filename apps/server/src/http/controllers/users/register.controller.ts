import z from "zod";
import { PrismaUserRepository } from "../../../repositories/prisma/user.repository";
import { UserService } from "../../../services/user-service";
import type { FastifyReply, FastifyRequest } from "fastify";
import { UserAlreadyExistsError } from "../../../services/errors/user-already-exists-error";

export async function register(request: FastifyRequest, reply: FastifyReply) {

    const registerBodySchema = z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
    })

    const { name, email, password } = registerBodySchema.parse(request.body)

    //Alguns logs de debug passado
    console.log("antes do trycatch")
    try {
        const userRepository = new PrismaUserRepository()
        const userService = new UserService(userRepository)


        console.log("Nome do usuario:", name)
        const userAlreadyExists = await userRepository.findByEmail(email)

        console.log("UserAlredyExists?", userAlreadyExists)

        const createdUser = await userService.register({ name, email, password })


        return reply.status(201).send({
            user: {
                id: createdUser.id,
                name: createdUser.name,
                email: createdUser.email,
                createdAt: createdUser.createdAt
            }
        })
    } catch (error) {
        if (error instanceof UserAlreadyExistsError) {
            return reply.status(409).send({ message: error.message })
        }
        throw error
    }
}