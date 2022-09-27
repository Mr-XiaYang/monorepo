import FastifyPlugin from "fastify-plugin";


export default FastifyPlugin<{ prefix: string }>(async (fastify, opts) => {
  fastify.route({
    url: `${opts.prefix}/pixel/:id`,
    method: "GET",
    async handler(req, reply) {
      reply.send({hello: "world"});
    },
  });
});
