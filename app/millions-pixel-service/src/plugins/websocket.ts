import FastifyPlugin from "fastify-plugin";

import FastifyWebsocket from "@fastify/websocket";

export default FastifyPlugin(async (fastify) => {
  fastify.register(FastifyWebsocket, {});
}, {
  name: "websocker",
});
