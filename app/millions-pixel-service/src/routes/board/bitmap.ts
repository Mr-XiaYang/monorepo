import fastifyPlugin from "fastify-plugin";
import { Static, Type } from "@sinclair/typebox";
import { commandOptions } from "@redis/client";

export default fastifyPlugin<{ prefix: string }>(async (fastify, opts) => {
  const emptyBitmap: ArrayBuffer = new Uint8ClampedArray(1920 * 1080).fill(255);
  const paramsSchema = Type.Object({
    id: Type.Integer({minimum: 1, maximum: 10}),
  });
  fastify.route<{
    Params: Static<typeof paramsSchema>
  }>({
    url: `${opts.prefix}/bitmap/:id`,
    method: "GET",
    schema: {
      params: paramsSchema,
    },
    async handler(req, reply) {
      const {redis} = fastify;
      const {id} = req.params;
      let bitmap: Buffer | null = await redis.get(
        commandOptions({returnBuffers: true}),
        `place_bitmap_${id}`,
      );
      if (bitmap == null) {
        bitmap = Buffer.from(emptyBitmap);
        await redis.set(`place_bitmap_${id}`, bitmap);
      }
      reply.type("application/octet-stream");
      reply.send(bitmap.subarray(0, 1920 * 1080));
    },
  });
});
