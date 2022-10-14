import { TypeCheck, TypeCompiler } from "@sinclair/typebox/compiler/index.js";
import { InvalidValueError, NotFoundError } from "./error";
import Schema from "./schema/schema";
import SchemaEncoder from "./schema/schema_encoder";
import { SchemaDefinition, SchemaModel } from "./type";

export interface SchemaOptions {
  skipEncodeValidate?: boolean;
}

export interface EncodeOptions {
  version?: number;
  skipValidate?: boolean;
}

class JsonBuffer<T extends Record<string, Schema<any>>> {
  private readonly options: Required<SchemaOptions> = {
    skipEncodeValidate: false,
  };

  private readonly schemas: Record<string, Schema<any>> = {};
  private readonly validators: WeakMap<SchemaDefinition, TypeCheck<any>> = new WeakMap();
  private readonly encoder: SchemaEncoder;
  private readonly decoder: any;

  constructor(schemas: T, options?: SchemaOptions) {
    this.options = {...this.options, ...options};
    this.encoder = new SchemaEncoder();
    this.register(schemas);
  }

  register<U extends Record<string, Schema<any>>>(schemas: U): JsonBuffer<T & U> {
    for (const [key, schema] of Object.entries(schemas)) {
      this.schemas[key] = schema;
      schema.versions.forEach(({definition}) => {
        this.validators.set(definition, TypeCompiler.Compile(definition));
      });
    }
    return this as unknown as JsonBuffer<T & U>;
  }

  getValidator<T extends SchemaDefinition>(definition: T): TypeCheck<T> {
    let typeCheck = this.validators.get(definition);
    if (typeCheck === undefined) {
      typeCheck = TypeCompiler.Compile(definition);
    }
    return typeCheck;
  }

  encode<K extends keyof T>(id: K, value: SchemaModel<T[K], true>, options?: EncodeOptions): Uint8Array
  encode<T extends Schema<any>>(schema: T, value: SchemaModel<T, true>, options?: EncodeOptions): Uint8Array
  encode(schemaOrId: string | Schema<any>, value: unknown, options?: EncodeOptions): Uint8Array {
    let schema: Schema<any>;
    if (typeof schemaOrId === "string") {
      schema = this.schemas[schemaOrId];
      if (schema == null) {
        throw new NotFoundError(`${schemaOrId} schema`);
      }
    } else {
      schema = schemaOrId;
    }

    const version = options?.version ?? schema.versions.length - 1;
    if (!(options?.skipValidate ?? this.options?.skipEncodeValidate)) {
      const errors = [...this.getValidator(schema.versions[version].definition).Errors(value)];
      if (errors.length) {
        throw new InvalidValueError(errors);
      }
    }

    return new SchemaEncoder().write(schema.versions[version].definition, value).build();
  }


  decode() {
  }

  encodeJson() {

  }

  decodeJson() {
  }
}


export default JsonBuffer;
