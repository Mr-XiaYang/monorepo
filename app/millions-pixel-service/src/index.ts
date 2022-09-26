import Fastify from "fastify";
import plugins from "./plugins";
import routes from "./routes";
import pino from "pino";
import pinoPretty from "pino-pretty";

const fastify = Fastify({logger: pino(pinoPretty({singleLine: true}))});
fastify.register(plugins);
fastify.register(routes);

fastify.listen({port: 8080}, (error) => {
  console.log(fastify.printPlugins());
  if (!error) {
    process.on("uncaughtException", (error) => {
      fastify.log.error("[uncaughtException]", error);
    });
    process.on("unhandledRejection", (error) => {
      fastify.log.error("[unhandledRejection]", error);
    });
  } else {
    fastify.log.error(error);
    process.exit(1);
  }
});
