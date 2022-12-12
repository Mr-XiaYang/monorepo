import { BaseField, isFieldOptions } from "../../base/field";
import { Form } from "../../form";
import { FieldOptions } from "../index";

type SetType<T> = T extends Set<infer V> ? V : never;

export type SetFieldOptions<T extends Record<string, any>, V extends Set<any>> = {
  type: "set",
  fields: FieldOptions<T, SetType<V>>
}

export function isSetFieldOptions(options: any): options is SetFieldOptions<any, any> {
  return isFieldOptions(options) && options.type === "array";
}


export class SetField<T extends Record<string, any>, V extends Set<any>> extends BaseField<T, V> {
  constructor(form: Form<T>, options: SetFieldOptions<T, V>) {
    super(form, options);
  }
}
