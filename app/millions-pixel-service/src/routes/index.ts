import fastifyPlugin from "fastify-plugin";
import auth from "./auth";
import board from "./board";

export default fastifyPlugin(async (fastify) => {
  await fastify.register(auth, {prefix: "/auth"});
  await fastify.register(board, {prefix: "/board"});
}, {name: "routes"});
