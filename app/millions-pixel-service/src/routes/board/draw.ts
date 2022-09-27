import FastifyPlugin from "fastify-plugin";


export default FastifyPlugin<{ prefix: string }>(async (fastify, opts) => {
  fastify.route({
    url: `${opts.prefix}/draw`,
    method: "GET",
    async handler() {
    },
  });
});
