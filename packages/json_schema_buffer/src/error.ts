import { TSchema } from "@sinclair/typebox";

type Code =
  | "NOT_FOUND"
  | "INVALID_SCHEMA"

  | "OK"
  | "CANCELLED"
  | "UNKNOWN"

  | "DEADLINE_EXCEEDED"
  | "ALREADY_EXISTS"
  | "PERMISSION_DENIED"
  | "RESOURCE_EXHAUSTED"
  | "FAILED_PRECONDITION"
  | "ABORTED"
  | "OUT_OF_RANGE"
  | "UNIMPLEMENTED"
  | "INTERNAL"
  | "UNAVAILABLE"
  | "DATA_LOSS"
  | "UNAUTHENTICATED"

export class SchemaError extends Error {
  code: Code;

  constructor(code: Code, message: string) {
    super(message);
    this.code = code;
  }
}

export class NotFoundError extends SchemaError {
  constructor(name: string) {
    super("NOT_FOUND", `The ${name} is not found.`);
  }
}

export class InvalidSchemaError extends SchemaError {
  constructor(schema: TSchema) {
    super("INVALID_SCHEMA", `invalid schema:\n${JSON.stringify(schema, null, 2)}`);
  }
}
