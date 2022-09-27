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

export type RedisOptions = RedisClientOptions & { namespace?: string; }

export default fastifyPlugin<RedisOptions>(async (fastify, opts) => {
  const {namespace, ...redisOptions} = opts;
  const client: RedisClientType<any, any, any> = createClient(redisOptions);
  if (namespace) {
    if (!fastify.redis) {
      fastify.decorate("redis", {});
    }
    if (fastify.redis[namespace]) {
      throw new Error(`Redis '${namespace}' instance namespace has already been registered`);
    }
    fastify.redis[namespace] = client;
    fastify.addHook("onClose", () => {
      fastify.redis[namespace].quit();
    });
  } else {
    if (fastify.redis) {
      throw new Error("redis has already been registered");
    }
    fastify.decorate("redis", client);
    fastify.addHook("onClose", () => {
      fastify.redis.quit();
    });
  }
  try {
    await client.connect();
    await client.ping();
  } catch (error) {
    fastify.log.error(error, `[redis plugin]: ${(error as Error).message}`);
  }
});
