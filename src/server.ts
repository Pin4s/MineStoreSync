import { app } from "./app"

app.listen({ port: 3333, host: '127.0.0.1' }, (err, address) => {
    console.log(`Server is running on ${address}`)

    if (err) {
        app.log.error(err)
    }
})
