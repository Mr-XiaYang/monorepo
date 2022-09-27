import FastifyPlugin from "fastify-plugin";
import bitmap from "./bitmap";
import draw from "./draw";
import pixel from "./pixel";
import ws from "./ws";

export default FastifyPlugin(async (fastify, opts: { prefix: string }) => {
  fastify.register(bitmap, opts);
  fastify.register(pixel, opts);
  fastify.register(draw, opts);
  fastify.register(ws, opts);
}, {name: "board-route"});
