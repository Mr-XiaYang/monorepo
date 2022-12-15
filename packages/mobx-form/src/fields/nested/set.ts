import { BaseNestedField, BaseNestedFieldOptions, isFieldOptions } from "../../base/field";
import { Form } from "../../form";
import { Field, FieldOptions } from "../type";

type SetType<T> = T extends Set<infer V> ? V : never;

export type SetFieldOptions<T extends Record<string, any>, V> =
  & BaseNestedFieldOptions<T, V>
  & { type: "set", childrenFields: FieldOptions<T, SetType<V>> }

export function isSetFieldOptions<T extends Record<string, any>, V>(options: any): options is SetFieldOptions<T, V> {
  return isFieldOptions(options) && options.type === "set";
}

export class SetField<T extends Record<string, any>, V> extends BaseNestedField<T, SetFieldOptions<T, V>, Set<Field<T, SetType<V>>>, V> {
  protected readonly emptyValue = new Set() as V;

  constructor(form: Form<T>, options: SetFieldOptions<T, V>) {
    super(form, options, new Set());
  }
}
