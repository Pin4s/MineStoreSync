import z from "zod";
import type { FastifyRequest, FastifyReply } from "fastify";
import { PrismaUserRepository } from "../../../repositories/prisma/user.repository";
import { AuthService } from "../../../services/auth-service";
import { InvalidCredentialsError } from "../../../services/errors/invalid-credentials-error";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    email: z.string().email(),
    password: z.string(),
  });

  const { email, password } = bodySchema.parse(request.body);

  try {
    const userRepository = new PrismaUserRepository();
    const authService = new AuthService(userRepository);

    const { user } = await authService.authenticate({ email, password });

    const token = await reply.jwtSign(
      { sub: user.id }
    );

    return reply.status(200).send({ token });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply.status(401).send({ message: error.message });
    }
    throw error;
  }
}