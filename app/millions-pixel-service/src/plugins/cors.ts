import fastifyPlugin from "fastify-plugin";

import fastifyCors from "@fastify/cors";

export default fastifyPlugin(async (fastify) => {
  await fastify.register(fastifyCors, {});
}, {
  name: "cors",
});
