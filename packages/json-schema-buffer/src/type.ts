import { Static, TSchema } from "@sinclair/typebox";
import type Schema from "./schema/schema";

export type JsonSchema<T extends Schema<any>> = T extends Schema<infer U> ? U : never
export type SchemaModel<T extends Schema<any>, AllVersion extends boolean = false> =
  T extends Schema<infer U, infer UU> ? AllVersion extends false ? Static<U> : Static<UU> : never
export type SchemaDefinition = TSchema;
export type SchemaMigrate<T extends SchemaDefinition, U extends SchemaDefinition> = (value: Static<T>) => Static<U>;
