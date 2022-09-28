import FastifyPlugin from "fastify-plugin";
import redis, { RedisOptions } from "./client/redis";

export default FastifyPlugin(async (fastify) => {
  await fastify.register<RedisOptions>(redis, {url: "redis://default:redispw@localhost:49153"});
}, {name: "routes"});
