'use strict';

var Fastify = require('fastify');
var FastifyPlugin = require('fastify-plugin');
var FastifySwagger = require('@fastify/swagger');
var FastifyWebsocket = require('@fastify/websocket');
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

var routes = FastifyPlugin__default["default"](async (fastify) => {
  fastify.register(auth, {prefix: "/auth"});
}, {name: "routes"});

const fastify = Fastify__default["default"]({logger: pino__default["default"](pinoPretty__default["default"]({singleLine: true}))});
fastify.register(plugins);
fastify.register(routes);

fastify.listen({port: 8080}, (error) => {
  console.log(fastify.printPlugins());
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
