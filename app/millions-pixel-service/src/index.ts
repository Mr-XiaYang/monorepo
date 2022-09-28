import Fastify from "fastify";
import plugins from "./plugins";
import routes from "./routes";
import storage from "./storage";
import pino from "pino";
import pinoPretty from "pino-pretty";

const fastify = Fastify({logger: pino(pinoPretty({singleLine: true}))});
fastify.register(plugins);
fastify.register(storage);
fastify.register(routes);
fastify.listen({port: 8080}, (error) => {
  if (!error) {
    process.on("uncaughtException", (error) => {
      fastify.log.error(error, `[uncaughtException]: ${(error as Error).message}`);
    });
    process.on("unhandledRejection", (error) => {
      fastify.log.error(error, `[unhandledRejection]: ${(error as Error).message}`);
    });
  } else {
    fastify.log.error(error);
    process.exit(1);
  }
});
