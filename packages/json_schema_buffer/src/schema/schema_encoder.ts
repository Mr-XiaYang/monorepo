import { TAnySchema } from "@sinclair/typebox";
import { TypeGuard } from "@sinclair/typebox/guard/index.js";
import { Buffer } from "buffer";
import { BufferWriter } from "../utils/buffer_writer";
import { VarInt } from "../utils/var_int";


type SchemaEncoderOptions = {
  nullAsUndefined?: boolean;
}

class SchemaEncoder {
  private readonly options: Required<SchemaEncoderOptions> = {
    nullAsUndefined: false,
  };

  private readonly bufferBlock: Buffer[] = [];

  constructor(options?: SchemaEncoderOptions) {
    this.options = {...this.options, ...options};
  }

  mateData(name: string, version: number) {
    this.bufferBlock.push(
      VarInt.from(Buffer.byteLength(name, "utf-8")).toBuffer(),
      Buffer.from(name, "utf-8"),
    );
    this.bufferBlock.push(
      VarInt.from(version).toBuffer(),
    );
  }

  writeNull(schema: object, value?: null): this {
    if (!this.options.nullAsUndefined) {
      this.bufferBlock.push(Buffer.alloc(1));
    }
    return this;
  }

  writeUndefined(schema: object, value?: undefined): this {
    return this;
  }

  write(schema: TAnySchema, value: any): this {
    const bufferWriter = new BufferWriter();
    if (schema.type === "null") {

    } else if (TypeGuard.TUndefined(schema)) {

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
    return Buffer.concat(this.bufferBlock);
  }
}

export default SchemaEncoder;
