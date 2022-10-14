import { TAnySchema } from "@sinclair/typebox";
import { TypeGuard } from "@sinclair/typebox/guard/index.js";
import { BufferWriter } from "../utils/buffer_writer";


class SchemaEncoder {
  uint8Arrays: Uint8Array[];

  constructor() {
    this.uint8Arrays = [];
  }

  write(schema: TAnySchema, value: any): SchemaEncoder {
    const bufferWriter = new BufferWriter();
    if (TypeGuard.TNull(schema) || TypeGuard.TUndefined(schema)) {

    } else if (TypeGuard.TLiteral(schema)) {

    } else if (TypeGuard.TString(schema)) {
      bufferWriter.writeString(value);
    } else if (TypeGuard.TNumber(schema)) {
      bufferWriter.writeNumber(value);
    } else if (TypeGuard.TInteger(schema)) {
      bufferWriter.writeInteger(value);
    } else if (TypeGuard.TBoolean(schema)) {
      this.uint8Arrays.push(new Uint8Array([value ? 255 : 0]));
      return this;
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
