import { FastifyInstance } from "fastify";
import { app } from "../../app";
import { receiveWebhook } from "./webhooks.controller";

export function webhooksRoutes(app: FastifyInstance){
    app.post('/central-cart', receiveWebhook)
}