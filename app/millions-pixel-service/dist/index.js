'use strict';

var Fastify = require('fastify');
var FastifyPlugin = require('fastify-plugin');
var FastifySwagger = require('@fastify/swagger');
var FastifyWebsocket = require('@fastify/websocket');
var typebox = require('@sinclair/typebox');
var client = require('@redis/client');
var pino = require('pino');
var pinoPretty = require('pino-pretty');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Fastify__default = /*#__PURE__*/_interopDefaultLegacy(Fastify);
var FastifyPlugin__default = /*#__PURE__*/_interopDefaultLegacy(FastifyPlugin);
var FastifySwagger__default = /*#__PURE__*/_interopDefaultLegacy(FastifySwagger);
var FastifyWebsocket__default = /*#__PURE__*/_interopDefaultLegacy(FastifyWebsocket);
var pino__default = /*#__PURE__*/_interopDefaultLegacy(pino);
var pinoPretty__default = /*#__PURE__*/_interopDefaultLegacy(pinoPretty);

var Swagger = FastifyPlugin__default["default"](async (fastify) => {
  fastify.register(FastifySwagger__default["default"], {});
}, {
  name: "swagger",
});

var Websocket = FastifyPlugin__default["default"](async (fastify) => {
  fastify.register(FastifyWebsocket__default["default"], {});
}, {
  name: "websocker",
});

var plugins = FastifyPlugin__default["default"](async (instance) => {
  instance.register(Websocket);
  instance.register(Swagger);
}, {
  name: "plugins",
});

var auth = FastifyPlugin__default["default"](async (fastify) => {
  fastify.route({
    url: "/sign",
    method: "GET",
    async handler() {
    },
  });
}, {name: "auth-route"});

var bitmap = FastifyPlugin__default["default"](async (fastify, opts) => {
  const paramsSchema = typebox.Type.Object({
    x: typebox.Type.Any(),
    y: typebox.Type.Integer(),
  });
  fastify.route

({
    url: `${opts.prefix}/bitmap/:x-:y`,
    method: "GET",
    schema: {
      params: paramsSchema,
    },
    async handler(req, reply) {
      // 480*270
      const {redis} = fastify;
      const {x, y} = req.params;
      await redis.bitField(`place_bitmap_${x}:${y}`, [
        {operation: "SET", encoding: "u8", offset: "#0", value: 12},
        {operation: "SET", encoding: "u8", offset: "#1", value: 13},
        {operation: "SET", encoding: "u8", offset: "#2", value: 14},
        {operation: "SET", encoding: "u8", offset: "#3", value: 15},
      ]);
      console.log(await redis.getBig(`place_bitmap_${x}:${y}`));
      // console.log(Uint8Array.from(await redis.bitField(`place_bitmap_${x}:${y}`,
      //   new Array(480 * 270).fill(undefined).map((_, index) => ({
      //     operation: "GET", encoding: "u8", offset: `#${index}`,
      //   })))));
      // console.log(new Uint8Array(480 * 270 * 4).fill(255).length);
    },
  });
});

var draw = FastifyPlugin__default["default"](async (fastify, opts) => {
  fastify.route({
    url: `${opts.prefix}/draw`,
    method: "GET",
    async handler() {
    },
  });
});

var pixel = FastifyPlugin__default["default"](async (fastify, opts) => {
  fastify.route({
    url: `${opts.prefix}/pixel/:id`,
    method: "GET",
    async handler(req, reply) {
      reply.send({hello: "world"});
    },
  });
});

var ws = FastifyPlugin__default["default"](async (fastify, opts) => {
  fastify.get(`${opts.prefix}/`, {websocket: true}, async (connect) => {
    connect.socket.on("message", (message) => {
      console.log(message);
    });
  });
});

var board = FastifyPlugin__default["default"](async (fastify, opts) => {
  fastify.register(bitmap, opts);
  fastify.register(pixel, opts);
  fastify.register(draw, opts);
  fastify.register(ws, opts);
}, {name: "board-route"});

var routes = FastifyPlugin__default["default"](async (fastify) => {
  fastify.register(auth, {prefix: "/auth"});
  fastify.register(board, {prefix: "/board"});
}, {name: "routes"});

var redis = FastifyPlugin__default["default"](async (fastify, opts) => {
  const {namespace, ...redisOptions} = opts;
  const client$1 = client.createClient(redisOptions);
  if (namespace) {
    if (!fastify.redis) {
      fastify.decorate("redis", {});
    }
    if (fastify.redis[namespace]) {
      throw new Error(`Redis '${namespace}' instance namespace has already been registered`);
    }
    fastify.redis[namespace] = client$1;
    fastify.addHook("onClose", () => {
      fastify.redis[namespace].quit();
    });
  } else {
    if (fastify.redis) {
      throw new Error("redis has already been registered");
    }
    fastify.decorate("redis", client$1);
    fastify.addHook("onClose", () => {
      fastify.redis.quit();
    });
  }
  try {
    await client$1.connect();
    await client$1.ping();
  } catch (error) {
    fastify.log.error(error, `[redis plugin]: ${(error ).message}`);
  }
});

var storage = FastifyPlugin__default["default"](async (fastify) => {
  fastify.register(redis, {});
}, {name: "routes"});

const fastify = Fastify__default["default"]({logger: pino__default["default"](pinoPretty__default["default"]({singleLine: true}))});
fastify.register(plugins);
fastify.register(storage);
fastify.register(routes);
fastify.listen({port: 8080}, (error) => {
  if (!error) {
    process.on("uncaughtException", (error) => {
      fastify.log.error("[uncaughtException]", error);
    });
    process.on("unhandledRejection", (error) => {
      fastify.log.error("[unhandledRejection]", error);
    });
  } else {
    fastify.log.error(error);
    process.exit(1);
  }
});
//# sourceMappingURL=index.js.map
