import FastifyPlugin from "fastify-plugin";

export default FastifyPlugin(async (fastify) => {
  fastify.route({
    url: "/sign",
    method: "GET",
    async handler() {
    },
  });
}, {name: "auth-route"});
