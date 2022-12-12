import * as console from "console";

interface ModelDefinition {
  database: string;
  table: string;
  fields: Record<string, Field<any, this>>;
}

interface BaseField<T> {
  column?: string;
  type:
    | "char" | "string" | "text"
    | "int8" | "uint8" | "int32" | "uint32" | "float" | "int64" | "uint64" | "double"
    | "date" | "datetime"
    | "boolean" | "enum"
    | "json"
    | "binary";
  required?: boolean;
  readonly?: boolean;
  defaultValue?: T | (() => T);
  description?: string;
}

interface PrimaryField<T, E extends ModelDefinition> extends BaseField<string | number | bigint> {
  primary: true;
  type: "string" | "char" | "text";
  prefix?: string;
  generator?: "autoincrement" | "uuid";
}

interface StringField<T, E extends ModelDefinition> extends BaseField<Date> {
  type: "string" | "char" | "text";
}

interface NumberField<T, E extends ModelDefinition> extends BaseField<Date> {
  type:
    | "int8" | "uint8"
    | "int32" | "int64"
    | "uint32" | "uint64"
    | "float" | "double";
}

interface DateField<T, E extends ModelDefinition> extends BaseField<Date> {
  type: "date" | "datetime";
}

interface EnumField<T, E extends ModelDefinition> extends BaseField<keyof T> {
  type: "enum",
  defaultValue?: keyof T
  values: T
}

interface BooleanField<T, E extends ModelDefinition> extends BaseField<boolean> {
  type: "boolean",
}

interface BinaryField<T, E extends ModelDefinition> extends BaseField<ArrayBuffer> {
  type: "binary",
}

interface ComputedField<T, E extends ModelDefinition> extends BaseField<T> {
  getter: (this: ModelType<E>) => T;
}

interface ComputedField<T, E extends ModelDefinition> extends BaseField<T> {
  loader: (this: ModelType<E>) => Promise<T>;
}

type Field<T, E extends ModelDefinition> =
  | PrimaryField<T, E>
  | StringField<T, E>
  | NumberField<T, E>
  | BooleanField<T, E>
  | DateField<T, E>
  | EnumField<T, E>
  | BinaryField<T, E>
  | ComputedField<T, E>


type FieldNullable<T extends BaseField<any>> =
  T extends PrimaryField<any, any> ?
    T["generator"] extends undefined ? never : null :
    T["required"] extends true ? never : null

type FieldType<T extends BaseField<any>> =
  T["type"] extends "char" | "string" | "text" ? string :
    T["type"] extends "int8" | "uint8" | "int32" | "uint32" | "float" ? number :
      T["type"] extends "int64" | "uint64" | "double" ? bigint :
        T["type"] extends "date" | "datetime" ? Date :
          T["type"] extends "boolean" ? boolean :
            T["type"] extends "binary" ? ArrayBuffer :
              T["type"] extends "enum" ? T extends EnumField<any, any>
                  ? keyof T["values"] : string | number :
                never

type ModelType<T extends ModelDefinition> = {
  [K in keyof T["fields"]]: FieldType<T["fields"][K]> | FieldNullable<T["fields"][K]>
}

const isSavedSymbol: unique symbol = Symbol("isSavedSymbol");
const isModifiedSymbol: unique symbol = Symbol("isModifiedSymbol");
const dataSymbol: unique symbol = Symbol("dataSymbol");
const modifiedDataSymbol: unique symbol = Symbol("modifiedDataSymbol");

class BaseModel<T extends object> {
  declare [dataSymbol]: { [K in keyof T]?: T[K] };
  declare [modifiedDataSymbol]: { [K in keyof T]?: T[K] };
  declare [isSavedSymbol]: boolean;
  declare [isModifiedSymbol]: boolean;

  [k: string]: any

  constructor(data: Partial<T> = {}) {
    Object.defineProperties(this, {
      [dataSymbol]: {enumerable: false, configurable: false, writable: true, value: data},
      [modifiedDataSymbol]: {enumerable: false, configurable: false, writable: true, value: {}},
      [isSavedSymbol]: {enumerable: false, configurable: false, writable: true, value: false},
      [isModifiedSymbol]: {
        enumerable: false, configurable: false, get(this: BaseModel<any>) {
          return this[isSavedSymbol] && !!Object.keys(this[modifiedDataSymbol]).length;
        },
      },
    });
  }

  reset(): void {
    this[modifiedDataSymbol] = {};
  }

  toObject(): T {
    return {...this} as unknown as T;
  }
}

export function defineModel<T extends ModelDefinition>(name: string, definition: T) {

  class Model extends BaseModel<ModelType<T>> {
    static definition: T = definition;

    constructor(...args: any[]) {
      super(...args);
      const propertyDescriptors: Record<string, PropertyDescriptor> = {};
      for (let key of Object.keys(Model.definition.fields)) {
        const fieldKey = key as keyof ModelType<T>;
        const fieldOptions: Field<any, any> = Model.definition.fields[fieldKey];
        const isReadonly = fieldOptions.readonly
          || !!(fieldOptions as PrimaryField<any, any>)?.generator
          || !!(fieldOptions as ComputedField<any, any>)?.getter;
        propertyDescriptors[key] = {
          enumerable: true,
          configurable: false,
          set: isReadonly ? undefined : function (this: Model, value: any) {
            if (this[key] !== value) {
              if (this[isSavedSymbol]) {
                this[modifiedDataSymbol][fieldKey] = value;
              } else {
                this[dataSymbol][fieldKey] = value;
              }
            }
          },
          get: function (this: Model) {
            return (fieldOptions as ComputedField<any, any>).getter?.apply(this)
              ?? this[modifiedDataSymbol][fieldKey]
              ?? this[dataSymbol][fieldKey]
              ?? (typeof fieldOptions.defaultValue === "function"
                ? fieldOptions.defaultValue()
                : fieldOptions.defaultValue)
              ?? null;
          },
        };
      }
      Object.defineProperties(this, propertyDescriptors);
    }
  }

  Object.defineProperty(Model, "name", {value: name});

  return Model as unknown as ({
    new(data: {
      [K in keyof ModelType<T> as null extends ModelType<T>[K] ? never : K]: ModelType<T>[K]
    } & {
      [K in keyof ModelType<T> as null extends ModelType<T>[K] ? K : never]?: ModelType<T>[K] | null
    }): Model & ModelType<T>
  });
}

const User = defineModel("User", {
  database: "oh_test",
  table: "t_user",
  fields: {
    id: {
      primary: true,
      type: "string",
      prefix: "01_",
    },
    gender: {
      column: "gender",
      type: "enum",
      defaultValue: "UNKNOWN",
      values: {
        UNKNOWN: "UNKNOWN",
        MALE: "MALE",
        FEMALE: "FEMALE",
      },
    },
    isMale: {
      type: "string",
      getter() {
        return this.gender === "MALE";
      },
    },
    status: {
      type: "enum",
      required: true,
      values: {
        NONACTIVE: "NONACTIVE",
        ACTIVE: "ACTIVE",
        DISABLE: "DISABLE",
        DELETED: "DELETED",
      },
    },
    createAt: {
      type: "datetime",
    },
  },
});


const user = new User({status: "NONACTIVE"});
user[isSavedSymbol] = true;
// console.log(User);
console.log(user.id);
user.id = "10";
user.id = "10";
console.log(user.id);
user.reset();
user.gender = "MALE";
console.log(user.id);
console.log(user.isMale);


