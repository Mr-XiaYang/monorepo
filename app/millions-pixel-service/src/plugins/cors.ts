import fastifyPlugin from "fastify-plugin";

import fastifyCors, { FastifyCorsOptions } from "@fastify/cors";

export default fastifyPlugin(async (fastify) => {
  await fastify.register<FastifyCorsOptions>(fastifyCors, {});
}, {
  name: "cors",
});
