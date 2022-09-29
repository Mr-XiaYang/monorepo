import fastifyPlugin from "fastify-plugin";


export default fastifyPlugin<{ prefix: string }>(async (fastify, opts) => {
  fastify.route({
    url: `${opts.prefix}/draw`,
    method: "GET",
    async handler() {
    },
  });
});
