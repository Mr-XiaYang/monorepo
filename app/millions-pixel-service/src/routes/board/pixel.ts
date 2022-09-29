import fastifyPlugin from "fastify-plugin";


export default fastifyPlugin<{ prefix: string }>(async (fastify, opts) => {
  fastify.route({
    url: `${opts.prefix}/pixel/:id`,
    method: "GET",
    async handler(req, reply) {
      reply.send({hello: "world"});
    },
  });
});
