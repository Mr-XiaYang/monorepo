import { sum } from "@m_xy/array_extend/sum";
import { Buffer } from "buffer";
import { InternalError } from "../error";

enum OperationType {
  Boolean = "Boolean",
  String = "String",
  Buffer = "Buffer",
  Variable = "Variable",
}

type BufferWriterOperation =
  | { type: OperationType.Boolean, value: boolean, length: 1 }
  | { type: OperationType.String, value: any, length: number }
  | { type: OperationType.Buffer, value: any, length: number }
  | { type: OperationType.Variable, value: any, length: number }

export class BufferWriter {

  private readonly operations: BufferWriterOperation[] = [];

  writeString(value: string): BufferWriter {
    this.operations.push({
      type: OperationType.String,
      value: value,
      length: Buffer.byteLength(value, "utf-8"),
    });
    return this;
  }

  writeNumber(value: number): BufferWriter {
    return this;
  }

  writeInteger(value: number): BufferWriter {
    return this;
  }

  writeBuffer(value: Uint8Array): BufferWriter {
    this.operations.push({
      type: OperationType.Buffer,
      value: value,
      length: value.byteLength,
    });
    return this;
  }

  writeBoolean(value: boolean): BufferWriter {
    this.operations.push({
      type: OperationType.Boolean, value, length: 1,
    });
    return this;
  }

  build(): Uint8Array {
    let length = sum(this.operations, (operation) => operation.length);
    let uint8Array = new Uint8Array(length);
    let uint8ArrayView = new DataView(uint8Array.buffer);

    let pos: number = 0;
    for (let operation of this.operations) {
      switch (operation.type) {
        case OperationType.Boolean:
          uint8ArrayView.setUint8(uint8Array.byteOffset + pos, operation.value ? 255 : 0);
          break;
        case OperationType.String:
          const writeLength = Buffer.from(
            uint8Array.buffer, uint8Array.byteOffset, uint8Array.byteLength,
          ).write(operation.value, pos, "utf-8");
          if (writeLength != operation.length) {
            throw new InternalError(`Expect ${operation.length} bytes but encoded ${writeLength} bytes`);
          }
          break;

      }


      pos += operation.length;
    }

    return uint8Array;
  }
}
