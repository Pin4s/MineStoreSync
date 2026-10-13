import Fastify from 'fastify'
import { weebhooksRoutes } from './modules/webhooks/weebhooks.routes'

const app = Fastify()

app.register(weebhooksRoutes, { prefix: "webhooks" })


export { app }