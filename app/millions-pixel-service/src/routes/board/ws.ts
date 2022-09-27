import FastifyPlugin from "fastify-plugin";

export default FastifyPlugin<{ prefix: string }>(async (fastify, opts) => {
  fastify.get(`${opts.prefix}/`, {websocket: true}, async (connect) => {
    connect.socket.on("message", (message) => {
      console.log(message);
    });
  });
});

