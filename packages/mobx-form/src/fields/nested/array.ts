import { BaseField, isFieldOptions } from "../../base/field";
import { Form } from "../../form";
import { FieldOptions } from "../index";

type ArrayType<T> = T extends Array<infer V> ? V : never;

export type ArrayFieldOptions<T extends Record<string, any>, V extends Array<any>> = {
  type: "array",
  fields: FieldOptions<T, ArrayType<V>>
}

export function isArrayFieldOptions(options: any): options is ArrayFieldOptions<any, any> {
  return isFieldOptions(options) && options.type === "array";
}


export class ArrayField<T extends Record<string, any>, V extends Array<any>> extends BaseField<T, V> {
  constructor(form: Form<T>, options: ArrayFieldOptions<T, V>) {
    super(form, options);
  }
}
