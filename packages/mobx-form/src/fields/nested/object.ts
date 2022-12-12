import { BaseField, isFieldOptions } from "../../base/field";
import { Form } from "../../form";
import { FieldOptions } from "../index";

export type ObjectFieldOptions<T extends Record<string, any>, V extends object> = {
  type: "object",
  fields: {
    [K in keyof V]: FieldOptions<T, V[K]>
  }
}

export function isObjectFieldOptions(options: any): options is ObjectFieldOptions<any, any> {
  return isFieldOptions(options) && options.type === "object";
}

export class ObjectField<T extends Record<string, any>, V extends object> extends BaseField<T, V> {
  constructor(form: Form<T>, options: ObjectFieldOptions<T, V>) {
    super(form, options);
  }
}
