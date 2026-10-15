import { app } from "./app"

const port = Number(process.env.PORT) || 3333

app.listen({ port, host: '0.0.0.0' }, (err, address) => {
    console.log(`Server is running on ${address}`)

    if (err) {
        app.log.error(err)
    }
})
