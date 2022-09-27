import FastifyPlugin from "fastify-plugin";
import auth from "./auth";
import board from "./board";

export default FastifyPlugin(async (fastify) => {
  fastify.register(auth, {prefix: "/auth"});
  fastify.register(board, {prefix: "/board"});
}, {name: "routes"});
