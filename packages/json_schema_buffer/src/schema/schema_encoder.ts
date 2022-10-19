import { TAnySchema } from "@sinclair/typebox";
import { TypeGuard } from "@sinclair/typebox/guard/index.js";
import { Buffer } from "buffer";
import { BufferWriter } from "../utils/buffer_writer";
import { VarInt } from "../utils/var_int";


class SchemaEncoder {
  bufferBlock: Buffer[];

  constructor() {
    this.bufferBlock = [];
  }

  write(schema: TAnySchema, value: any): SchemaEncoder {
    const bufferWriter = new BufferWriter();
    if (TypeGuard.TNull(schema) || TypeGuard.TUndefined(schema)) {

    } else if (TypeGuard.TLiteral(schema)) {

    } else if (TypeGuard.TString(schema)) {
      bufferWriter.writeString(value);
    } else if (schema.type === "number") {
      switch (schema.variant) {
        case "float":
        case "double":
      }
    } else if (schema.type === "integer") {
      switch (schema.variant) {
        case "int32":
        case "int64":
          const int = VarInt.fromBuffer(value).zzEncode();
          this.bufferBlock.push(VarInt.from(int.byteLength).toBuffer(), int.toBuffer());
          break;
        case "uInt32":
        case "uInt64":
          const uInt = VarInt.fromBuffer(value);
          this.bufferBlock.push(VarInt.from(uInt.byteLength).toBuffer(), uInt.toBuffer());
          break;
      }
    } else if (schema.type === "boolean") {
      this.bufferBlock.push(VarInt.from(Number(value)).toBuffer());
    } else if (TypeGuard.TUint8Array(schema)) {

    } else if (TypeGuard.TRef(schema)) {

    } else if (TypeGuard.TObject(schema)) {
      if (schema.properties) {
        for (const key of Object.keys(schema.properties)) {
          let prop = schema.properties[key];
          let propValue = value[key];
          console.log(prop, propValue);
        }

      }
    } else if (TypeGuard.TArray(schema)) {

    } else if (TypeGuard.TRecord(schema)) {

    } else if (TypeGuard.TTuple(schema)) {

    } else if (TypeGuard.TUnion(schema)) {

    } else if (TypeGuard.TAny(schema) || TypeGuard.TUnknown(schema)) {

    } else if (TypeGuard.TNever(schema)) {

    }

    return this;
  }

  build(): Uint8Array {
    return Buffer.concat(this.uint8Arrays);
  }
}

export default SchemaEncoder;
