import fastifyPlugin from "fastify-plugin";

import fastifyWebsocket, { WebsocketPluginOptions } from "@fastify/websocket";

export default fastifyPlugin(async (fastify) => {
  await fastify.register<WebsocketPluginOptions>(fastifyWebsocket, {});
}, {
  name: "websocket",
});
