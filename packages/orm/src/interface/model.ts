import { Definition } from "./definition";


const isSavedSymbol: unique symbol = Symbol("isSavedSymbol");
const isModifiedSymbol: unique symbol = Symbol("isModifiedSymbol");
const dataSymbol: unique symbol = Symbol("dataSymbol");
const modifiedDataSymbol: unique symbol = Symbol("modifiedDataSymbol");

class Model<T extends Record<string, any>> {
  [dataSymbol]: T;
  [modifiedDataSymbol]: Partial<T>;

  [K: string]: any

  constructor(data: T) {
    this[dataSymbol] = data;
    this[modifiedDataSymbol] = {};
  }

  public merge(data: Partial<T>): this {
    return this;
  }

  public async insert(): Promise<this> {
    return this;
  }

  public async update(): Promise<this> {
    return this;
  }

  public async save(): Promise<this> {
    return this;
  }

  public async remove(): Promise<this> {
    return this;
  }

  public async delete(): Promise<this> {
    return this;
  }
}

interface ModelConstructor<T extends Record<string, any>> {
  new(data: T): T & Model<T>;

  readonly name: string;
  readonly definition: Definition<T>;
}

function defineModel<T extends Record<string, any>>(definition: Definition<T>) {
  const model = class extends Model<T> {
    static readonly definition: Definition<T> = definition;
  } as unknown as ModelConstructor<T>;
  Object.defineProperty(model, "name", {value: definition.name});
  Object.defineProperties(model.prototype, Object.entries(model.definition.fields).reduce<PropertyDescriptorMap & ThisType<Model<T>>>(
    (properties, [fieldKey, fieldOptions]) => ({
      ...properties, [fieldKey]: {
        enumerable: true, configurable: false,
        get: function (this: Model<T>) {
          return this[modifiedDataSymbol][fieldKey]
            ?? this[dataSymbol][fieldKey]
            ?? (typeof fieldOptions.defaultValue === "function"
              ? fieldOptions.defaultValue()
              : fieldOptions.defaultValue)
            ?? null;
        },
      },
    }), {}));
  return model;
}

interface IUser {
  readonly id?: number;
  nickname: string;
  phoneNumber: string;
  email: string;
  lastSignTime?: Date | null;
  status?: "Test" | "Test01";
  createAt?: Date;
  updateAt?: Date;
  deleteAt?: Date | null;
}

const User = defineModel<IUser>({
  name: "User",
  fields: {
    id: {
      name: "id",
      type: "uint32",
    },
    nickname: {
      name: "nickname",
      type: 'string',
      required: true,
    },
    phoneNumber: {
      name: "phone_number",
      required: true,
    },
    email: {
      name: "email",
      required: true,
    },
    status: {
      name: "status",
      required: true,
    },
    lastSignTime: {
      name: "last_sign_time",
      required: false,
    },
    createAt: {
      name: "create_at",
      required: true,
    },
    updateAt: {
      name: "update_at",
      required: true,
    },
    deleteAt: {
      name: "delete_at",
      required: false,
    },
  },
});

// new User({nickname: "test", phoneNumber: "", email: "", status: "Test"});


