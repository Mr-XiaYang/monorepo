import fastifyPlugin from "fastify-plugin";
import bitmap from "./bitmap";
import draw from "./draw";
import pixel from "./pixel";

export default fastifyPlugin(async (fastify, opts: { prefix: string }) => {
  await fastify.register(bitmap, opts);
  await fastify.register(pixel, opts);
  await fastify.register(draw, opts);
}, {name: "board-route"});
