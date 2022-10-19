import type { SocketStream } from "@fastify/websocket";
import removeOne from "@m_xy/array_extend/remove_one";
import { commandOptions } from "@redis/client";
import { Static, Type } from "@sinclair/typebox";
import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin<{ prefix: string }>(async (fastify, opts) => {
  const emptyBitmap: ArrayBuffer = new Uint8ClampedArray(1920 * 1080).fill(255);
  const paramsSchema = Type.Object({
    worldId: Type.String(),
  });
  const connects = new Map<string, SocketStream[]>();
  const subscriber = fastify.redis.duplicate();
  await subscriber.connect();
  await subscriber.pSubscribe<false>(`channel:place_bitmap_*`, (message, channel) => {
    const bitmapId = channel.slice(8);
    fastify.redis.clients
    connects.get(bitmapId)?.forEach((connect) => {
      connect.socket.send(message);
    });
  });
  setInterval(() => {
    const x = Math.ceil(Math.random() * (1920 / 2));
    const y = Math.ceil(Math.random() * (1080 / 2));
    fastify.redis.publish(`channel:place_bitmap_1`, JSON.stringify({
      worldId: "1",
      x: Math.random() < 0.5 ? x : -x,
      y: Math.random() < 0.5 ? y : -y,
      color: Math.floor(Math.random() * 256),
    }));
  }, 50);

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
      if (connects.has(bitmapId)) {
        connects.get(bitmapId)!.push(connect);
      } else {
        connects.set(bitmapId, [connect]);
      }
      connect.once("end", () => {
        removeOne(connects.get(bitmapId) ?? [], connect);
      });
    },
  });
});
