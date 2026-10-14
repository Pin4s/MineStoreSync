import Fastify from 'fastify'
import { webhooksRoutes } from './modules/webhooks/webhooks.routes'

const app = Fastify()

app.register(webhooksRoutes, { prefix: "webhooks" })


export { app }