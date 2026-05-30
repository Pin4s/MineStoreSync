import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

import { PrismaUserRepository } from "../../../repositories/prisma/user.repository";
import { UserAlreadyExistsError } from "../../../services/errors/user-already-exists-error";
import { UserService } from "../../../services/user-service";

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
  });

  const { name, email, password } = registerBodySchema.parse(request.body);

  try {
    const userRepository = new PrismaUserRepository();
    const userService = new UserService(userRepository);
    const createdUser = await userService.register({ name, email, password });

    return reply.status(201).send({
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        createdAt: createdUser.createdAt
      }
    });
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }

    throw error;
  }
}
