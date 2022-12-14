import type { RedisClientOptions, RedisClientType, RedisFunctions, RedisModules, RedisScripts } from "@redis/client";
import { createClient } from "@redis/client";
import fastifyPlugin from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    redis: RedisClientType & {
      [namespace: string]: RedisClientType
    };
  }
}

export type RedisPluginOptions = RedisClientOptions

export default fastifyPlugin<RedisPluginOptions>(async (fastify, opts) => {
  if (fastify.redis) {
    throw new Error("redis has already been registered");
  }
  const client: RedisClientType<any, any, any> = createClient(opts);
  fastify.decorate("redis", client);
  fastify.addHook("onClose", () => {
    client.quit();
  });
  try {
    await client.connect();
    await client.ping();
  } catch (error) {
    fastify.log.error(error, `[redis plugin]: ${(error as Error).message}`);
  }
});
