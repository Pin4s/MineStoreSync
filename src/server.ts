import { app } from "./app"
import { env } from "./config/env"

app.listen({ port: 3333, host: '127.0.0.1' }, (err, address) => {
    console.log(`Server is running on ${address}`)

    if (err) {
        app.log.error(err)
    }
})

app.get('/api-test', async (request, reply) => {
    const response = await fetch('https://api.centralcart.io/v1/app', {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${env.CENTRALCART_API_KEY}`
        }
    })

    console.log(response)
    return reply.send(response.body)
})
