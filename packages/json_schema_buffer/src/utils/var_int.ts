import { Buffer } from "buffer";

export class VarInt {
  private readonly buffer: Buffer = Buffer.alloc(8);

  get highUInt32(): number {
    return this.buffer.readUInt32BE(0);
  }

  private set highUInt32(value: number) {
    this.buffer.writeUInt32BE(value, 0);
  }

  get lowUint32(): number {
    return this.buffer.readUInt32BE(4);
  }

  set lowUint32(value: number) {
    this.buffer.writeUInt32BE(value, 4);
  }

  get byteLength(): number {
    let part0 = this.lowUint32,
      part1 = (this.lowUint32 >>> 28 | this.highUInt32 << 4) >>> 0,
      part2 = this.highUInt32 >>> 24;
    return part2 === 0
      ? part1 === 0
        ? part0 < 16384
          ? part0 < 128 ? 1 : 2
          : part0 < 2097152 ? 3 : 4
        : part1 < 16384
          ? part1 < 128 ? 5 : 6
          : part1 < 2097152 ? 7 : 8
      : part2 < 128 ? 9 : 10;
  }

  constructor(highUInt32: number = 0, lowUInt32: number = 0) {
    this.highUInt32 = highUInt32;
    this.lowUint32 = lowUInt32;
  }

  static from(value: number | bigint): VarInt {

    if (typeof value === "bigint") {
      const buffer = Buffer.alloc(8);
      if (value >= 0) {
        buffer.writeBigUInt64BE(value);
      } else {
        buffer.writeBigInt64BE(~(-value) + 1n);
      }
      return new VarInt(buffer.readUInt32BE(0), buffer.readUInt32BE(4));
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
      return new VarInt(high, low);
    }
  }


  static fromBuffer(buffer: Buffer) {
    if (!buffer.length) {
      return new VarInt();
    }
    if (buffer[buffer.length - 1] > 128) {
      throw Error("invalid varInt encoding");
    }
    const low = buffer.slice(-5, -1).reduceRight((previousValue, currentValue, currentIndex) => {
      if (currentValue < 128) {
        throw Error("invalid varInt encoding");
      } else {
        return (previousValue << 7) + (currentValue ^ 128);
      }
    }, buffer[buffer.length - 1]);
    const high = buffer.slice(0, buffer.length - 5).reduceRight((previousValue: number | undefined, currentValue, currentIndex) => {
      if (currentValue < 128) {
        throw Error("invalid varInt encoding");
      }
    });
  }

  zzEncode(): VarInt {
    let mask = this.highUInt32 >> 31;
    this.highUInt32 = ((this.highUInt32 << 1 | this.lowUint32 >>> 31) ^ mask) >>> 0;
    this.lowUint32 = (this.lowUint32 << 1 ^ mask) >>> 0;
    return this;
  }

  zzDecode(): VarInt {
    let mask = -(this.lowUint32 & 1);
    this.lowUint32 = ((this.lowUint32 >>> 1 | this.highUInt32 << 31) ^ mask) >>> 0;
    this.highUInt32 = (this.highUInt32 >>> 1 ^ mask) >>> 0;
    return this;
  }

  toNumber(unsigned ?: boolean): number {
    if (!unsigned && this.buffer.readUInt32BE() >>> 31) {
      let high = ~this.highUInt32 >>> 0;
      let low = ~this.lowUint32 >>> 0;
      return -(high * 0x1_0000_0000 + low + 1);
    }
    return this.highUInt32 * 0x1_0000_0000 + this.lowUint32;
  }

  toBigNumber(unsigned?: boolean): bigint {
    if (!unsigned && this.buffer.readUInt32BE() >>> 31) {
      return this.buffer.readBigInt64BE();
    }
    return this.buffer.readBigUInt64BE();
  }

  toBuffer() {
    const buffer: Buffer = Buffer.alloc(this.byteLength);
    let pos = 0, high = this.highUInt32, low = this.lowUint32;
    while (high) {
      buffer[pos++] = low & 127 | 128;
      low = (low >>> 7 | high << 25) >>> 0;
      high >>>= 7;
    }
    while (low > 127) {
      buffer[pos++] = low & 127 | 128;
      low = low >>> 7;
    }
    buffer[pos++] = low;
    return buffer;
  }
}
