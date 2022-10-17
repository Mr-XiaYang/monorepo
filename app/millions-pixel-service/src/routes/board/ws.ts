import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin<{ prefix: string }>(async (fastify, opts) => {
  fastify.get(`${opts.prefix}/bitmap/:worldId`, {websocket: true}, async (connect) => {

    connect.socket.on("message", (message) => {
      fastify.redis
      console.log(message);
    });
  });
});

