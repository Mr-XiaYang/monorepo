import fastifyPlugin from "fastify-plugin";
import bitmap from "./bitmap";
import draw from "./draw";
import pixel from "./pixel";
import ws from "./ws";

export default fastifyPlugin(async (fastify, opts: { prefix: string }) => {
  await fastify.register(bitmap, opts);
  await fastify.register(pixel, opts);
  await fastify.register(draw, opts);
  await fastify.register(ws, opts);
}, {name: "board-route"});
