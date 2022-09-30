import fastifyPlugin from "fastify-plugin";
import { Static, Type } from "@sinclair/typebox";
import { commandOptions } from "@redis/client";

export default fastifyPlugin<{ prefix: string }>(async (fastify, opts) => {
  const emptyBitmap = Buffer.from(Uint8ClampedArray.from(
    new Array(1920 * 1080),
    (_, i) => (i % 1080 && i % 2) ? 15 : 0,
  ));
  const paramsSchema = Type.Object({
    index: Type.Integer({minimum: 1, maximum: 10}),
  });
  fastify.route<{
    Params: Static<typeof paramsSchema>
  }>({
    url: `${opts.prefix}/bitmap/:index`,
    method: "GET",
    schema: {
      params: paramsSchema,
    },
    async handler(req, reply) {
      // 480*270
      const {redis} = fastify;
      const {index} = req.params;

      let bitmap: Buffer | null = await redis.get(
        commandOptions({returnBuffers: true}),
        `place_bitmap_${index}`,
      );
      if (bitmap == null) {
        bitmap = emptyBitmap;
        await redis.set(`place_bitmap_${index}`, emptyBitmap);
      }
      reply.type("application/octet-stream");
      reply.send(bitmap.subarray(0, 1920 * 1080));
    },
  });
});
