import { RedisClientType } from "@redis/client";
import fastifyPlugin from "fastify-plugin";
import { Document, parseDocument } from "yaml";
import fs from "fs";
import { RedisPluginOptions } from "./storage/client/redis";
import path from "path";

interface ConfigPluginOptions {
  configPath?: string;
}

declare module "fastify" {
  interface FastifyInstance {
    config: Config;
  }
}

interface Config {
  redisStorage: RedisPluginOptions;
}

const defaultConfig: Config = {
  redisStorage: {
    url: undefined,
  },
};

export default fastifyPlugin<ConfigPluginOptions>(async (fastify, opts) => {
  const {configPath} = opts;
  let config: Config = defaultConfig;
  if (configPath) {
    if (fs.existsSync(configPath)) {
      config = Object.assign(defaultConfig, parseDocument(fs.readFileSync(configPath, "utf-8")).toJS());
    } else {
      fs.mkdirSync(path.dirname(configPath), {recursive: true});
      fs.writeFileSync(configPath, new Document(defaultConfig).toString());
    }
  }
  fastify.decorate("config", config);
});
