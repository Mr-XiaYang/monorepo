import FastifyPlugin from "fastify-plugin";
import auth from "./auth";
import board from "./board";

export default FastifyPlugin(async (fastify) => {
  await fastify.register(auth, {prefix: "/auth"});
  await fastify.register(board, {prefix: "/board"});
}, {name: "routes"});
