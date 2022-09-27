import FastifyPlugin from "fastify-plugin";
import { Static, Type } from "@sinclair/typebox";
import { commandOptions } from "@redis/client";

export default FastifyPlugin<{ prefix: string }>(async (fastify, opts) => {
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
      const result = await redis.bitField(`place_bitmap_${x}:${y}`, [
        {operation: "SET", encoding: "u8", offset: "#0", value: 12},
        {operation: "SET", encoding: "u8", offset: "#1", value: 13},
        {operation: "SET", encoding: "u8", offset: "#2", value: 14},
        {operation: "SET", encoding: "u8", offset: "#3", value: 15},
      ]);
      console.log(await redis.getBig(`place_bitmap_${x}:${y}`));
      // console.log(Uint8Array.from(await redis.bitField(`place_bitmap_${x}:${y}`,
      //   new Array(480 * 270).fill(undefined).map((_, index) => ({
      //     operation: "GET", encoding: "u8", offset: `#${index}`,
      //   })))));
      // console.log(new Uint8Array(480 * 270 * 4).fill(255).length);
    },
  });
});
