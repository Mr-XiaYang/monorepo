'use strict';

var Fastify = require('fastify');
var fastifyPlugin = require('fastify-plugin');
var fastifyCors = require('@fastify/cors');
var fastifySwagger = require('@fastify/swagger');
var fastifyWebsocket = require('@fastify/websocket');
var typebox = require('@sinclair/typebox');
var client = require('@redis/client');
var pino = require('pino');
var pinoPretty = require('pino-pretty');
var yaml = require('yaml');
var fs = require('fs');
var path = require('path');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Fastify__default = /*#__PURE__*/_interopDefaultLegacy(Fastify);
var fastifyPlugin__default = /*#__PURE__*/_interopDefaultLegacy(fastifyPlugin);
var fastifyCors__default = /*#__PURE__*/_interopDefaultLegacy(fastifyCors);
var fastifySwagger__default = /*#__PURE__*/_interopDefaultLegacy(fastifySwagger);
var fastifyWebsocket__default = /*#__PURE__*/_interopDefaultLegacy(fastifyWebsocket);
var pino__default = /*#__PURE__*/_interopDefaultLegacy(pino);
var pinoPretty__default = /*#__PURE__*/_interopDefaultLegacy(pinoPretty);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

var cors = fastifyPlugin__default["default"](async (fastify) => {
  await fastify.register(fastifyCors__default["default"], {});
}, {
  name: "cors",
});

var swagger = fastifyPlugin__default["default"](async (fastify) => {
  fastify.register(fastifySwagger__default["default"], {});
}, {
  name: "swagger",
});

var websocket = fastifyPlugin__default["default"](async (fastify) => {
  await fastify.register(fastifyWebsocket__default["default"], {});
}, {
  name: "websocket",
});

var plugins = fastifyPlugin__default["default"](async (instance) => {
  await instance.register(cors);
  await instance.register(websocket);
  await instance.register(swagger);
}, {
  name: "plugins",
});

var auth = fastifyPlugin__default["default"](async (fastify) => {
  fastify.route({
    url: "/sign",
    method: "GET",
    async handler() {
    },
  });
}, {name: "auth-route"});

var bitmap = fastifyPlugin__default["default"](async (fastify, opts) => {
  const emptyBitmap = Buffer.from(Uint8ClampedArray.from(
    new Array(480 * 270),
    (_, i) => i % 2 ? 15 : 0,
  ));
  const paramsSchema = typebox.Type.Object({
    x: typebox.Type.Any(),
    y: typebox.Type.Integer(),
  });
  fastify.route

({
    url: `${opts.prefix}/bitmap/:x/:y`,
    method: "GET",
    schema: {
      params: paramsSchema,
    },
    async handler(req, reply) {
      // 480*270
      const {redis} = fastify;
      const {x, y} = req.params;

      let bitmap = await redis.get(
        client.commandOptions({returnBuffers: true}),
        `place_bitmap_${x}:${y}`,
      );
      if (bitmap == null) {
        bitmap = emptyBitmap;
        await redis.set(`place_bitmap_${x}:${y}`, emptyBitmap);
      }
      reply.type("application/octet-stream");
      reply.send(bitmap.subarray(0, 480 * 270));
    },
  });
});

var draw = fastifyPlugin__default["default"](async (fastify, opts) => {
  fastify.route({
    url: `${opts.prefix}/draw`,
    method: "GET",
    async handler() {
    },
  });
});

var pixel = fastifyPlugin__default["default"](async (fastify, opts) => {
  fastify.route({
    url: `${opts.prefix}/pixel/:id`,
    method: "GET",
    async handler(req, reply) {
      reply.send({hello: "world"});
    },
  });
});

var ws = fastifyPlugin__default["default"](async (fastify, opts) => {
  fastify.get(`${opts.prefix}/`, {websocket: true}, async (connect) => {
    connect.socket.on("message", (message) => {
      console.log(message);
    });
  });
});

var board = fastifyPlugin__default["default"](async (fastify, opts) => {
  await fastify.register(bitmap, opts);
  await fastify.register(pixel, opts);
  await fastify.register(draw, opts);
  await fastify.register(ws, opts);
}, {name: "board-route"});

var routes = fastifyPlugin__default["default"](async (fastify) => {
  await fastify.register(auth, {prefix: "/auth"});
  await fastify.register(board, {prefix: "/board"});
}, {name: "routes"});

var redis = fastifyPlugin__default["default"](async (fastify, opts) => {
  if (fastify.redis) {
    throw new Error("redis has already been registered");
  }
  const client$1 = client.createClient(opts);
  fastify.decorate("redis", client$1);
  fastify.addHook("onClose", () => {
    client$1.quit();
  });
  try {
    await client$1.connect();
    await client$1.ping();
  } catch (error) {
    fastify.log.error(error, `[redis plugin]: ${(error ).message}`);
  }
});

var storage = fastifyPlugin__default["default"](async (fastify) => {
  await fastify.register(redis, fastify.config.redisStorage);
}, {name: "routes"});

const defaultConfig = {
  redisStorage: {
    url: undefined,
  },
};

var config = fastifyPlugin__default["default"](async (fastify, opts) => {
  const {configPath} = opts;
  let config = defaultConfig;
  if (configPath) {
    if (fs__default["default"].existsSync(configPath)) {
      config = Object.assign(defaultConfig, yaml.parseDocument(fs__default["default"].readFileSync(configPath, "utf-8")).toJS());
    } else {
      fs__default["default"].mkdirSync(path__default["default"].dirname(configPath), {recursive: true});
      fs__default["default"].writeFileSync(configPath, new yaml.Document(defaultConfig).toString());
    }
  }
  fastify.decorate("config", config);
});

const fastify = Fastify__default["default"]({logger: pino__default["default"](pinoPretty__default["default"]({singleLine: true}))});
fastify.register(config, {configPath: "config.yaml"});
fastify.register(plugins);
fastify.register(storage);
fastify.register(routes);
fastify.listen({host: "0.0.0.0", port: 8080}, (error) => {
  if (!error) {
    process.on("uncaughtException", (error) => {
      fastify.log.error(error, `[uncaughtException]: ${(error ).message}`);
    });
    process.on("unhandledRejection", (error) => {
      fastify.log.error(error, `[unhandledRejection]: ${(error ).message}`);
    });
  } else {
    fastify.log.error(error);
    process.exit(1);
  }
});
//# sourceMappingURL=index.js.map
