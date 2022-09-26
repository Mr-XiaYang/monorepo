import FastifyPlugin from "fastify-plugin";
import Swagger from "./swagger";
import Websocket from "./websocket";

export default FastifyPlugin(async (instance) => {
  instance.register(Websocket);
  instance.register(Swagger);
}, {
  name: "plugins",
});
