import type { FastifyRequest, FastifyReply } from "fastify";
import { PrismaUserRepository } from "../../../repositories/prisma/user.repository";

export async function profile(request: FastifyRequest, reply: FastifyReply) {
  const userRepository = new PrismaUserRepository();
  const user = await userRepository.findById(request.user.sub);

  if (!user) {
    return reply.status(404).send({ message: "User not found." });
  }

  return reply.status(200).send({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    }
  });
}