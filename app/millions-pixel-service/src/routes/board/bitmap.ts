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


  fastify.get(`${opts.prefix}/bitmap`, {
    websocket: true,
  }, (connect) => {

  });


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

// 960*540 标清世界  19bit + 8bit + 8bit + 8bit + 8bit 51bit 【518400】 (6B 2.97MB) (4B 2MB)
// 分片大小 2*2 4份 每份加载大小约 0.5MB

// 1920*1080 高清世界 21bit + 8bit + 8bit + 8bit + 8bit 53bit 【2073600】 (7B 13.85MB) （4B 8MB）
// 分片大小 4*4 16份 每份加载大小约 0.5MB

// 4096*2160 超清世界 24bit + 8bit + 8bit + 8bit + 8bit 56bit 【8847360】 (7B 60MB) （4B 33.75MB）
// 分片大小 8*8 64份 每份加载大小约 0.5MB

// 首屏加载大小 320*180


// 4K 全量更新 60MB左右
/**
 *  5分钟存档一次 一天288次
 *  一天数据量最大 16GB
 *  3年数据量大概 20TB
 */
