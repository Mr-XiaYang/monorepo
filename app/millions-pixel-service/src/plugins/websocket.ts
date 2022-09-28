import fastifyPlugin from "fastify-plugin";

import fastifyWebsocket from "@fastify/websocket";

export default fastifyPlugin(async (fastify) => {
  await fastify.register(fastifyWebsocket, {});
}, {
  name: "websocket",
});
