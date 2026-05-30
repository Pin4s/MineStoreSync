import type { FastifyRequest, FastifyReply } from "fastify";

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  // Vamos ver exatamente como o header está chegando no servidor
  console.log("Header de Auth recebido:", request.headers.authorization);
  
  try {
    await request.jwtVerify();
  } catch (err) {
    console.error("Erro na verificação do JWT:", err); 
    return reply.status(401).send({ message: "Unauthorized." });
  }
}