'use strict';

var Fastify = require('fastify');
var FastifyPlugin = require('fastify-plugin');
var fastifyCors = require('@fastify/cors');
var fastifySwagger = require('@fastify/swagger');
var fastifyWebsocket = require('@fastify/websocket');
var typebox = require('@sinclair/typebox');
var client = require('@redis/client');
var pino = require('pino');
var pinoPretty = require('pino-pretty');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Fastify__default = /*#__PURE__*/_interopDefaultLegacy(Fastify);
var FastifyPlugin__default = /*#__PURE__*/_interopDefaultLegacy(FastifyPlugin);
var fastifyCors__default = /*#__PURE__*/_interopDefaultLegacy(fastifyCors);
var fastifySwagger__default = /*#__PURE__*/_interopDefaultLegacy(fastifySwagger);
var fastifyWebsocket__default = /*#__PURE__*/_interopDefaultLegacy(fastifyWebsocket);
var pino__default = /*#__PURE__*/_interopDefaultLegacy(pino);
var pinoPretty__default = /*#__PURE__*/_interopDefaultLegacy(pinoPretty);

var cors = FastifyPlugin__default["default"](async (fastify) => {
  await fastify.register(fastifyCors__default["default"], {});
}, {
  name: "cors",
});

var swagger = FastifyPlugin__default["default"](async (fastify) => {
  fastify.register(fastifySwagger__default["default"], {});
}, {
  name: "swagger",
});

var websocket = FastifyPlugin__default["default"](async (fastify) => {
  await fastify.register(fastifyWebsocket__default["default"], {});
}, {
  name: "websocket",
});

var plugins = FastifyPlugin__default["default"](async (instance) => {
  await instance.register(cors);
  await instance.register(websocket);

  await instance.register(swagger);
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
  const emptyBitmap = Buffer.from(Uint8ClampedArray.from(
    new Array(480 * 270),
    (_, i) => i % 2 ? 255 : 0,
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
  await fastify.register(bitmap, opts);
  await fastify.register(pixel, opts);
  await fastify.register(draw, opts);
  await fastify.register(ws, opts);
}, {name: "board-route"});

var routes = FastifyPlugin__default["default"](async (fastify) => {
  await fastify.register(auth, {prefix: "/auth"});
  await fastify.register(board, {prefix: "/board"});
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
  await fastify.register(redis, {url: "redis://default:redispw@localhost:49153"});
}, {name: "routes"});

const fastify = Fastify__default["default"]({logger: pino__default["default"](pinoPretty__default["default"]({singleLine: true}))});
fastify.register(plugins);
fastify.register(storage);
fastify.register(routes);
fastify.listen({port: 8080}, (error) => {
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
