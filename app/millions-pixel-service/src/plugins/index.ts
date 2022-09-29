import fastifyPlugin from "fastify-plugin";
import cors from "./cors";
import swagger from "./swagger";
import websocket from "./websocket";

export default fastifyPlugin(async (instance) => {
  await instance.register(cors);
  await instance.register(websocket);
  await instance.register(swagger);
}, {
  name: "plugins",
});
