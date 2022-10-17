import fastifyPlugin from "fastify-plugin";
import { Static, Type } from "@sinclair/typebox";
import { commandOptions } from "@redis/client";
import type { SocketStream } from "@fastify/websocket";
import removeOne from "@m_xy/array_extend/remove_one";

export default fastifyPlugin<{ prefix: string }>(async (fastify, opts) => {
  const emptyBitmap: ArrayBuffer = new Uint8ClampedArray(1920 * 1080).fill(255);
  const paramsSchema = Type.Object({
    worldId: Type.String(),
  });
  const connects = new Map<string, SocketStream[]>();
  fastify.route<{ Params: Static<typeof paramsSchema> }>({
    url: `${opts.prefix}/bitmap/:worldId`, method: "GET", schema: {params: paramsSchema},
    async handler(req, reply) {
      const {redis} = fastify;
      const {worldId} = req.params;

      const bitmapId = `place_bitmap_${worldId}`;
      let bitmap: Buffer | null = await redis.get(
        commandOptions({returnBuffers: true}), bitmapId,
      );
      if (bitmap == null) {
        bitmap = Buffer.from(emptyBitmap);
        await redis.set(bitmapId, bitmap);
      }
      reply.type("application/octet-stream");
      reply.send(bitmap.subarray(0, 1920 * 1080));
    },
    async wsHandler(connect, req) {
      const {worldId} = req.params;
      const bitmapId = `place_bitmap_${worldId}`;
      connect.once("open", () => {
        if (connects.has(bitmapId)) {
          connects.get(bitmapId)!.push(connect);
        } else {
          connects.set(bitmapId, [connect]);
        }
      });
      connect.once("close", ()=> {
        removeOne(connects.get(bitmapId) ?? [], connect)
      })

      fastify.redis.subscribe("test", ()=> {

      })
      // fastify.redis.subscribe();
    },
  });
});
