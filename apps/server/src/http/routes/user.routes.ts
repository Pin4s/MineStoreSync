import type { FastifyInstance } from "fastify";
import { register } from "../controllers/users/register.controller";
import { authenticate } from "../controllers/users/authenticate.controller";
import { verifyJWT } from "../middlewares/verify-jwt";
import { profile } from "../controllers/users/profile.controller";

export function userRoutes(app: FastifyInstance) {
    app.post("/", register)
    app.post("/sessions", authenticate)

    /** Autenticadas **/
    app.get("/me", { onRequest: [verifyJWT] }, profile);
}
