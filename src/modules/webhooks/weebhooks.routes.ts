import { FastifyInstance } from "fastify";
import { app } from "../../app";
import { receiveWeebhook } from "./weebhooks.controller";

export function weebhooksRoutes(app: FastifyInstance){
    app.post('/central-cart', receiveWeebhook)
}