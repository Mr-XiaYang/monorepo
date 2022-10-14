import { TSchema } from "@sinclair/typebox";
import type { ValueError } from "@sinclair/typebox/compiler";

type Code =
  | "NOT_FOUND"
  | "INVALID_SCHEMA"
  | "INVALID_VALUE"
  | "UNAVAILABLE"
  | "INTERNAL"

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

  | "DATA_LOSS"
  | "UNAUTHENTICATED"

class BaseError extends Error {
  code: Code;

  constructor(code: Code, message: string) {
    super(message);
    this.code = code;
  }
}

export class InternalError extends BaseError {
  constructor(message: string) {
    super("INTERNAL", message);
  }
}

export class NotFoundError extends BaseError {
  constructor(name: string) {
    super("NOT_FOUND", `The ${name} is not found.`);
  }
}

export class InvalidSchemaError extends BaseError {
  constructor(schema: TSchema) {
    super("INVALID_SCHEMA", `\n${JSON.stringify(schema, null, 2)}`);
  }
}

export class InvalidValueError extends BaseError {
  constructor(errors: ValueError[]) {
    super("INVALID_VALUE", `\n${JSON.stringify(errors, null, 2)}`);
  }
}
