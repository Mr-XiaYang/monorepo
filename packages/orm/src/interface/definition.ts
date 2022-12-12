import NumberField, { NumberFieldOptions } from "./model_field/number_field";

type Equals<X, Y, TrueResult = true, FalseResult = false> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2)
    ? TrueResult : FalseResult;

export interface Definition<T extends object> {
  name: string;
  fields: {
    [K in keyof T]-?: FieldOptions<T, K>
  };
  options?: {
    fieldNamePrefix?: string
    fieldNameSuffix?: string
  };
}

type FieldOptions<T extends object, K extends keyof T> =
  number extends T[K] ? NumberFieldOptions<T, K>
    : never




type FieldBaseProperty<T extends object, K extends keyof T> =
  & { name?: string }
  & FieldReadonlyProperty<T, K>
  & FieldRequiredProperty<T, K>
  & FieldDefaultValueProperty<T, K>

type FieldRequiredProperty<T extends object, K extends keyof T> =
  null extends T[K] ? { required?: false } : { required: true }
type FieldReadonlyProperty<T extends object, K extends keyof T> =
  Equals<Pick<T, K>, Readonly<Pick<T, K>>, { readonly: true }, { readonly?: false }>
type FieldDefaultValueProperty<T extends object, K extends keyof T> =
  null extends T[K] ? { defaultValue?: T[K] } : { defaultValue?: T[K] }
