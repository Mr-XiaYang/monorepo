import { makeObservable, observable } from "mobx";
import { DeepPartial, DeepReadonly } from "./type";

interface BaseField<T, V> {
  type: string;
}

interface TextField<T, V> extends BaseField<T, V> {
  type: "text";
}

interface PasswordField<T, V> extends BaseField<T, V> {
  type: "password";
}

interface TelephoneField<T, V> extends BaseField<T, V> {
  type: "telephone";
}

interface EmailField<T, V> extends BaseField<T, V> {
  type: "email";
}

interface UrlField<T, V> extends BaseField<T, V> {
  type: "url";
}

type StringField<T, V> =
  | TextField<T, V>
  | PasswordField<T, V>
  | TelephoneField<T, V>
  | EmailField<T, V>
  | UrlField<T, V>

interface IntegerField<T, V> extends BaseField<T, V> {
  type: "integer";
}

interface DecimalField<T, V> extends BaseField<T, V> {
  type: "decimal";
}

type NumberField<T, V> =
  | IntegerField<T, V>
  | DecimalField<T, V>

interface BooleanField<T, V> extends BaseField<T, V> {
  type: "boolean";
}

interface SetField<T, V> {
  type: "set";
}

interface MapField<T, K, V> {
  type: "map";
}

type ArrayField<T, V> = {
  type: "array"
  field: Field<T, V>
}

type ObjectField<T, V> = {
  type: "object"
  fields: {
    [K in keyof V]: Field<T, V[K]>
  }
}

type Field<T, V> =
  V extends string ? StringField<T, V> :
    V extends number ? NumberField<T, V> :
      V extends boolean ? BooleanField<T, V> :
        V extends Set<infer SetType> ? SetField<T, SetType> :
          V extends Map<infer KeyType, infer MapType> ? MapField<T, KeyType, MapType> :
            V extends Array<infer ArrayType> ? ArrayField<T, ArrayType> :
              V extends object ? ObjectField<T, V> :
                unknown


type Fields<T> = {
  [K in keyof T]: Field<T, T[K]>
}

type FormState<T extends Record<string, any>> = {
  defaultValues?: DeepPartial<DeepReadonly<T>>;
}


type FormOptions<T> = {
  defaultValues: DeepPartial<T>;
}

export class Form<T extends Record<string, any>> {
  readonly fields: Fields<T>;

  get valid() {
    return false;
  }

  get changed() {
    return false;
  }

  get readonly() {
    return false;
  }

  get focused() {
    return false;
  }

  get blurred() {
    return false;
  }

  constructor(fields: Fields<T>) {
    this.fields = fields;
    makeObservable<this, "fields" | "state">(this, {
      fields: observable,
      state: observable,
    });
  }

  init() {
  }

  clear() {
  }

  reset() {

  }

  submit() {

  }
}

type FormData = {
  loginName: string
  password: string
  username: {
    firstName: string
    lastName: string
  }
  tag: string[]
  children: Array<{
    test: number
  }>
}


function markForm<T extends Record<string, any>>(fields: Fields<T>): Fields<T> {
  return null as any;
}

const form = new Form<FormData>({
  loginName: {type: "email"},
  password: {type: "password"},
  username: {
    type: "object",
    fields: {
      firstName: {type: "text"},
      lastName: {type: "text"},
    },
  },
  tag: {
    type: "array",
    field: {
      type: "text",
    },
  },
  children: {
    type: "array",
    field: {
      type: "object",
      fields: {
        test: {
          type: "integer",

        },
      },
    },
  },
});


