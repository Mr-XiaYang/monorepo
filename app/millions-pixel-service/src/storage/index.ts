import FastifyPlugin from "fastify-plugin";
import redis, { RedisOptions } from "./client/redis";

export default FastifyPlugin(async (fastify) => {
  fastify.register<RedisOptions>(redis, {});
}, {name: "routes"});
