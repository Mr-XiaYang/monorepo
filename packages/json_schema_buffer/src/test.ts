import { Buffer } from "buffer";
import { VarInt } from "./utils/var_int";
// import { VarInt } from "./utils/var_int";

// const Test = new Schema(
//   Type.Object({
//     a: Type.Number(),
//     b: Type.String(),
//   }),
// ).nextVersion(
//   Type.Object({
//     a: Type.Number(),
//     b: Type.Number(),
//   }),
//   (values) => (
//     {
//       ...values,
//       b: parseInt(values.b),
//     }
//   ),
// );
//
// const jsonBuffer = new JsonBuffer({Test})
//
// console.log(jsonBuffer.encode(new Schema(Type.Boolean()), true));
// jsonBuffer.encode("Test", {a: 1, b: 1})

// console.log(VarInt.from(0x1_ffff_ffffn).buffer.reduce((pre, current) => pre + " " + current.toString(2).padStart(8, "0"), ""));
// console.log(VarInt.from(0x1_ffff_ffff).buffer.reduce((pre, current) => pre + " " + current.toString(2).padStart(8, "0"), ""));
VarInt.fromInt32(1)
VarInt.fromInt32(-1)
// console.log(VarInt.from(0xffff_ffffn).readInt32());
// console.log(VarInt.from(-0xffff_ffffn).readInt32());
// console.log(VarInt.from(-1).readInt32());
// console.log(VarInt.from(-0x1_ffff_ffff).buffer.reduce((pre, current) => pre + " " + current.toString(2).padStart(8, "0"), ""));
// console.log(VarInt.from(-0x1_ffff_ffffn).buffer.reduce((pre, current) => pre + " " + current.toString(2).padStart(8, "0"), ""));

// const buffer = Buffer.alloc(8);
// // console.log(buffer.readUint32BE(0));
// // console.log(buffer.readUint32BE(4));
// console.log(buffer, buffer.reduce((pre, current) => pre + " " + current.toString(2).padStart(8, "0"), ""));
// buffer.writeUint32BE(0x1_ffff_ffff / 0x1_0000_0000 >>> 0)
// buffer.writeUint32BE(0x1_ffff_ffff >>> 0, 4)
//
// // buffer.writeBigInt64BE(-0x1n);
// console.log(buffer, buffer.reduce((pre, current) => pre + " " + current.toString(2).padStart(8, "0"), ""));

// console.log((-0xffff).toString(2));
// console.log((0xffff >>> 0).toString(2));
// console.log((~(0xffff >>> 0)).toString(2));
// console.log(((~0xffff >>> 0) >>> 0).toString(2));
//
//
// console.log();
// console.log(-2,~2,((~2)+1));
// console.log(-1,~-1,-((~-1)+1));
// console.log(0,~-0,-((~0)+1));
// console.log(1,~1, -((~1)+1));
// console.log(2,~2, -((~2)+1));

// console.log(schema.encode(Type.Boolean(), true).buffer);
// console.log(schema.encode(Type.Boolean(), false).buffer);
// console.log(schema.encode(Type.String(), "test/123啊实打实的").buffer);
