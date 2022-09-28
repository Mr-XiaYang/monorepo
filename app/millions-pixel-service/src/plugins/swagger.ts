import fastifyPlugin from "fastify-plugin";

import fastifySwagger from "@fastify/swagger";

export default fastifyPlugin(async (fastify) => {
  fastify.register(fastifySwagger, {});
}, {
  name: "swagger",
});
