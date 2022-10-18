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

// console.log(VarInt.from(0).zzEncode().toNumber());
// console.log(VarInt.from(-1).zzEncode().toNumber());
// console.log(VarInt.from(1).zzEncode().toNumber());
// console.log(VarInt.from(-2).zzEncode().toNumber());
// console.log(VarInt.from(2).zzEncode().toNumber());
console.log(VarInt.from(150).toBuffer().reduce((pre, current) => pre + " " + current.toString(2).padStart(8, "0"), ""));
VarInt.fromBuffer(VarInt.from(150).toBuffer());
// console.log(varint.byteLength);
// console.log(varint.buffer.reduce((pre, current) => pre + " " + current.toString(2).padStart(8, "0"), ""));
// ;
// console.log(VarInt.from(-12345).buffer.reduce((pre, current) => pre + " " + current.toString(2).padStart(8, "0"), ""));
// console.log(VarInt.from(-12345).zzEncode().buffer.reduce((pre, current) => pre + " " + current.toString(2).padStart(8, "0"), ""));
// console.log(VarInt.from(0x1_ffff_ffff).toNumber() === 0x1_ffff_ffff);
// console.log(VarInt.from(-0x1_ffff_ffff).toNumber() === -0x1_ffff_ffff);
// console.log(VarInt.from(0x1_ffff_ffff).toBigNumber() === 0x1_ffff_ffffn);
// console.log(VarInt.from(0x1_ffff_ffff).toBigNumber() === 0x1_ffff_ffffn);
// console.log(VarInt.from(-0x1_ffff_ffff).toBigNumber() === -0x1_ffff_ffffn);
// console.log(VarInt.from(0xffff_ffff_ffff_ffffn).toBigNumber(true) === 0xffff_ffff_ffff_ffffn);
// console.log(VarInt.from(0xffff_ffffn).readInt32());
// console.log(VarInt.from(-0xffff_ffffn).zzEncode().zzDecode().toBigNumber(), -0xffff_ffffn);
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
