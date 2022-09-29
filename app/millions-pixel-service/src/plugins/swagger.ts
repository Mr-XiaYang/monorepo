import fastifyPlugin from "fastify-plugin";

import fastifySwagger,{SwaggerOptions} from "@fastify/swagger";

export default fastifyPlugin(async (fastify) => {
  fastify.register<SwaggerOptions>(fastifySwagger, {});
}, {
  name: "swagger",
});
