import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin<{ prefix: string }>(async (fastify, opts) => {
  fastify.get(`${opts.prefix}/`, {websocket: true}, async (connect) => {
    connect.socket.on("message", (message) => {
      console.log(message);
    });
  });
});

