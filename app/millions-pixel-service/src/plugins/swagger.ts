import FastifyPlugin from "fastify-plugin";

import FastifySwagger from "@fastify/swagger";

export default FastifyPlugin(async (fastify) => {
  fastify.register(FastifySwagger, {});
}, {
  name: "swagger",
});
