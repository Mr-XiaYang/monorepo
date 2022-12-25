import { BaseNestedField, BaseNestedFieldOptions, isFieldOptions } from "../../interface/field/field";
import { Form } from "../../form";
import { makeFields } from "../../utils";
import { Field, FieldOptions } from "../type";

export type ObjectFieldOptions<T extends Record<string, any>, V> =
  & BaseNestedFieldOptions<T, V>
  & { type: "object", childrenFields: { [K in keyof V]: FieldOptions<T, V[K]> } }

export function isObjectFieldOptions<T extends Record<string, any>, V>(options: any): options is ObjectFieldOptions<T, V> {
  return isFieldOptions(options) && options.type === "object";
}

export class ObjectField<T extends Record<string, any>, V> extends BaseNestedField<T, ObjectFieldOptions<T, V>, { [K in keyof V]-?: Field<T, V[K]> }, V> {
  protected readonly emptyValue = {} as V;

  constructor(form: Form<T>, options: ObjectFieldOptions<T, V>) {
    super(form, options, makeFields(form, options.childrenFields));
  }
}
