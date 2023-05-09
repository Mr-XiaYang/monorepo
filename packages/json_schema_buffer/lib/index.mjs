const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
// Use a lookup table to find the index.
const lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
for(let i = 0; i < base64Chars.length; i++){
    lookup[base64Chars.charCodeAt(i)] = i;
}
function bufferToBase64(buffer) {
    if (typeof Buffer !== "undefined") {
        return Buffer.from(buffer).toString("base64");
    }
    let base64 = "";
    const len = buffer.length;
    for(let i = 0; i < len; i += 3){
        console.log(buffer[i] >> 2);
        base64 += base64Chars[buffer[i] >> 2];
        base64 += base64Chars[(buffer[i] & 3) << 4 | buffer[i + 1] >> 4];
        base64 += base64Chars[(buffer[i + 1] & 15) << 2 | buffer[i + 2] >> 6];
        base64 += base64Chars[buffer[i + 2] & 63];
        break;
    }
    if (len % 3 === 2) {
        base64 = base64.substring(0, base64.length - 1) + '=';
    } else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + '==';
    }
    return base64;
}
{
    console.log(Buffer.from(Uint8Array.of(255, 12, 24, 18)).toString("base64"));
    // @ts-ignore
    Buffer = undefined;
    console.log(bufferToBase64(Uint8Array.of(255, 12, 24, 18)));
}

var Base64Util = /*#__PURE__*/Object.freeze({
  __proto__: null,
  bufferToBase64: bufferToBase64
});

export { Base64Util };
