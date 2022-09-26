import FastifyPlugin from "fastify-plugin";
import auth from "./auth";

export default FastifyPlugin(async (fastify) => {
  fastify.register(auth, {prefix: "/auth"});
}, {name: "routes"});
