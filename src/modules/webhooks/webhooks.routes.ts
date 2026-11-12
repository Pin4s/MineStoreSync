import { FastifyInstance } from "fastify";
import { receiveWebhook } from "./webhooks.controller";

export function webhooksRoutes(app: FastifyInstance){
    // Scoped to this plugin: the body stays as the raw bytes so the signature is checked over
    // exactly what Central Cart sent. The controller parses the JSON after verifying it.
    app.addContentTypeParser("application/json", { parseAs: "buffer" }, (_request, body, done) => {
        done(null, body)
    })

    app.post('/central-cart', receiveWebhook)
}
