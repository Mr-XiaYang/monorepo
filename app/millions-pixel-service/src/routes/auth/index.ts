import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin(async (fastify) => {
  fastify.route({
    url: "/sign",
    method: "GET",
    async handler() {
    },
  });
}, {name: "auth-route"});
