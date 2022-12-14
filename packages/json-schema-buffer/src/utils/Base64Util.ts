const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
// Use a lookup table to find the index.
const lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
for (let i = 0; i < base64Chars.length; i++) {
  lookup[base64Chars.charCodeAt(i)] = i;
}

export function bufferToBase64(buffer: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64");
  }
  let base64 = "";
  const len = buffer.length;

  for (let i = 0; i < len; i += 3) {
    console.log(buffer[i]>>2);
    base64 += base64Chars[buffer[i] >> 2];
    base64 += base64Chars[((buffer[i] & 3) << 4) | (buffer[i + 1] >> 4)];
    base64 += base64Chars[((buffer[i + 1] & 15) << 2) | (buffer[i + 2] >> 6)];
    base64 += base64Chars[buffer[i + 2] & 63];
    break
  }

  if (len % 3 === 2) {
    base64 = base64.substring(0, base64.length - 1) + '=';
  }
  else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + '==';
  }

  return base64;
}
