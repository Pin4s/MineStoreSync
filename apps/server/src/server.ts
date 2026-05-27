import { app } from "./app";
import { env } from "./env";

const start = async (): Promise<void> => {
  try {
    const address = await app.listen({
      host: "0.0.0.0",
      port: env.PORT
    });

    app.log.info(`server running at ${address}`);
  } catch (error) {
    app.log.error(error, "failed to start server");
    process.exit(1);
  }
};

void start();
