import { Type } from "@sinclair/typebox";
import { JsonBuffer, Schema } from "./index";

const Test = new Schema(
  Type.Object({
    a: Type.Number(),
    b: Type.String(),
  }),
).nextVersion(
  Type.Object({
    a: Type.Number(),
    b: Type.Number(),
  }),
  (values) => (
    {
      ...values,
      b: parseInt(values.b),
    }
  ),
);

const jsonBuffer = new JsonBuffer({Test})

console.log(jsonBuffer.encode(new Schema(Type.Boolean()), true));
jsonBuffer.encode("Test", {a: 1, b: 1})


// console.log(schema.encode(Type.Boolean(), true).buffer);
// console.log(schema.encode(Type.Boolean(), false).buffer);
// console.log(schema.encode(Type.String(), "test/123啊实打实的").buffer);
