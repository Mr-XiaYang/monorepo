export class VarInt {
  private buffer: Buffer;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
  }

  static from<T extends number | bigint>(value: T): VarInt {
    const buffer = Buffer.alloc(8);
    if (typeof value === "bigint") {
      if (value >= 0) {
        buffer.writeBigUInt64BE(value);
      } else {
        buffer.writeBigInt64BE(~(-value) + 1n);
      }
    } else {
      let high: number, low: number;
      if (value >= 0) {
        high = value / 0x1_0000_0000 >>> 0;
        low = value >>> 0;
      } else {
        high = ~(-value / 0x1_0000_0000 >>> 0) >>> 0;
        low = ~(-value >>> 0) >>> 0;
        if (++low > 0xffff_ffff) {
          low = 0;
          if (++high > 0xffff_ffff) {
            high = 0;
          }
        }
      }
      buffer.writeUInt32BE(high);
      buffer.writeUInt32BE(low, 4);
    }
    return new VarInt(buffer);
  }

  readInt(): number {
    console.log(this.buffer.readUInt32BE() >>> 31);
    return -(~this.buffer.readUInt32BE(0) + 1 >>> 0);
  }

  readBigInt(): bigint {
    let low = ~this.buffer.readUInt32BE(4) + 1 >>> 0;
    let high = ~this.buffer.readUInt32BE(0) >>> 0;
    return 0n;
  }

  readUInt(): number {
    return this.buffer.readUInt32BE(4);
  }

  readUInt64(): bigint {
    return this.buffer.readBigUInt64BE(0);
  }
}
