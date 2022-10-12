import { TSchema } from "@sinclair/typebox";
import { TypeCheck, TypeCompiler } from "@sinclair/typebox/compiler";
import { InvalidSchemaError, NotFoundError } from "./error";

export interface SchemaOptions {
  skipEncodeValidate?: boolean;
}

export interface EncodeOptions {
  skipValidate?: boolean;
}

export default class Schema<T extends TSchema[]> {
  private readonly options: Required<SchemaOptions> = {
    skipEncodeValidate: false,
  };

  private readonly definitions: Record<string, TSchema> = {};
  private readonly validators: Record<string, TypeCheck<any>> = {};
  private readonly encoder: any;
  private readonly decoder: any;

  constructor(definitions: T, options?: SchemaOptions) {
    this.options = {...this.options, ...options};
    for (const schema of definitions) {
      if (!!schema.$id) {
        this.definitions[schema.$id] = schema;
        this.validators[schema.$id] = TypeCompiler.Compile(schema);
      } else {
        throw new InvalidSchemaError(schema);
      }
    }
  }

  private getValidator(schema: TSchema) {
    if (!schema.$id) {
      throw new InvalidSchemaError(schema);
    }
    if (!this.validators[schema.$id]) {
      this.validators[schema.$id] = TypeCompiler.Compile(schema);
    }
    return this.validators[schema.$id];
  }

  encode(schemaOrId: string, value: any, options?: EncodeOptions): Uint8Array
  encode(schemaOrId: TSchema, value: any, options?: EncodeOptions): Uint8Array
  encode(schemaOrId: string | TSchema, value: any, options?: EncodeOptions): Uint8Array {
    let schema: TSchema;
    if (typeof schemaOrId !== "string") {
      schema = schemaOrId;
    } else {
      schema = this.definitions[schemaOrId];
    }

    if (schema == null) {
      throw new NotFoundError(`${schemaOrId} schema`);
    }

    if (!(options?.skipValidate ?? this.options?.skipEncodeValidate)) {
      throw this.getValidator(schema).Errors(value);
    }

    return null as any;
  }

  encodeJson() {
  }

  decode() {
  }

  decodeJson() {
  }
}
