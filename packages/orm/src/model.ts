import * as console from "console";

interface ModelDefinition {
  database: string;
  table: string;
  fields: Record<string, Field<any>>;
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

interface PrimaryField<T> extends BaseField<string | number | bigint> {
  primary: true;
  type: "string" | "char" | "text";
  prefix?: string;
  generator?: "autoincrement" | "uuid";
}

interface StringField<T> extends BaseField<Date> {
  type: "string" | "char" | "text";
}

interface NumberField<T> extends BaseField<Date> {
  type:
    | "int8" | "uint8"
    | "int32" | "int64"
    | "uint32" | "uint64"
    | "float" | "double";
}

interface DateField<T> extends BaseField<Date> {
  type: "date" | "datetime";
}

interface EnumField<T> extends BaseField<keyof T> {
  type: "enum",
  defaultValue?: keyof T
  values: T
}

interface BooleanField<T> extends BaseField<boolean> {
  type: "boolean",
}

interface BinaryField<T> extends BaseField<ArrayBuffer> {
  type: "binary",
}

interface ComputedField<T> extends BaseField<T> {
  getter: (this: any) => T;
}

type Field<T> =
  | PrimaryField<T>
  | StringField<T>
  | NumberField<T>
  | BooleanField<T>
  | DateField<T>
  | EnumField<T>
  | BinaryField<T>
  | ComputedField<T>


type FieldNullable<T extends BaseField<any>> =
  T extends PrimaryField<any> ?
    T["generator"] extends undefined ? never : null :
    T["required"] extends true ? never : null
type FieldType<T extends BaseField<any>> =
  T["type"] extends "char" | "string" | "text" ? string :
    T["type"] extends "int8" | "uint8" | "int32" | "uint32" | "float" ? number :
      T["type"] extends "int64" | "uint64" | "double" ? bigint :
        T["type"] extends "date" | "datetime" ? Date :
          T["type"] extends "boolean" ? boolean :
            T["type"] extends "binary" ? ArrayBuffer :
              T["type"] extends "enum" ? T extends EnumField<any>
                  ? keyof T["values"] : string | number :
                never


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
  type ModelType = {
    [K in keyof T["fields"]]: FieldType<T["fields"][K]> | FieldNullable<T["fields"][K]>
  }

  class Model extends BaseModel<ModelType> {
    static definition: T = definition;

    constructor(...args: any[]) {
      super(...args);
      const propertyDescriptors: Record<string, PropertyDescriptor> = {};
      for (let key of Object.keys(Model.definition.fields)) {
        const fieldKey = key as keyof ModelType;
        const fieldOptions: Field<any> = Model.definition.fields[fieldKey];
        const isReadonly = fieldOptions.readonly
          || !!(fieldOptions as PrimaryField<any>)?.generator
          || !!(fieldOptions as ComputedField<any>)?.getter;
        propertyDescriptors[key] = {
          enumerable: true,
          configurable: false,
          get: function (this: Model) {
            return (fieldOptions as ComputedField<any>).getter?.apply(this)
              ?? this[modifiedDataSymbol][fieldKey]
              ?? this[dataSymbol][fieldKey]
              ?? (typeof fieldOptions.defaultValue === "function"
                ? fieldOptions.defaultValue()
                : fieldOptions.defaultValue)
              ?? null;
          },
          set: isReadonly ? undefined : function (this: Model, value: any) {
            if (this[key] !== value) {
              if (this[isSavedSymbol]) {
                this[modifiedDataSymbol][fieldKey] = value;
              } else {
                this[dataSymbol][fieldKey] = value;
              }
            }
          },
        };
      }
      Object.defineProperties(this, propertyDescriptors);
    }
  }

  Object.defineProperty(Model, "name", {value: name});
  Object.defineProperty(Model.prototype, "inspect", {
    value: function () {
      return "test";
    },
  });

  return Model as unknown as ({
    new(data: {
      [K in keyof ModelType as null extends ModelType[K] ? never : K]: ModelType[K]
    } & {
      [K in keyof ModelType as null extends ModelType[K] ? K : never]?: ModelType[K] | null
    }): Model & ModelType
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
        return this.gender === "enum";
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
console.log(user.id);
console.log(user.toObject());


