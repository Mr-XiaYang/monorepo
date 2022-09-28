import FastifyPlugin from "fastify-plugin";
import { Static, Type } from "@sinclair/typebox";
import { commandOptions } from "@redis/client";

export default FastifyPlugin<{ prefix: string }>(async (fastify, opts) => {
  const emptyBitmap = Buffer.from(Uint8ClampedArray.from(
    new Array(480 * 270),
    (_, i) => i % 2 ? 255 : 0,
  ));
  const paramsSchema = Type.Object({
    x: Type.Any(),
    y: Type.Integer(),
  });
  fastify.route<{
    Params: Static<typeof paramsSchema>
  }>({
    url: `${opts.prefix}/bitmap/:x-:y`,
    method: "GET",
    schema: {
      params: paramsSchema,
    },
    async handler(req, reply) {
      // 480*270
      const {redis} = fastify;
      const {x, y} = req.params;

      let bitmap: Buffer | null = await redis.get(
        commandOptions({returnBuffers: true}),
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
