import fastifyPlugin from "fastify-plugin";
import redis, { RedisPluginOptions } from "./client/redis";

export default fastifyPlugin(async (fastify) => {
  await fastify.register<RedisPluginOptions>(redis, fastify.config.redisStorage);
}, {name: "routes"});
