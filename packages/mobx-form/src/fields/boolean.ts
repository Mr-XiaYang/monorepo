import { BaseField, BaseFieldOptions, isFieldOptions } from "../base/field";
import { Form } from "../form";

export interface BooleanFieldOptions<T extends Record<string, any>, V extends boolean> extends BaseFieldOptions<T, V> {
  type: "boolean";
}

export function isBooleanFieldOptions(options: any): options is BooleanFieldOptions<any, any> {
  return isFieldOptions(options) && options.type === "boolean";
}

export class BooleanField<T extends Record<string, any>, V extends boolean> extends BaseField<T, V> {
  constructor(form: Form<T>, options: BooleanFieldOptions<T, V>) {
    super(form, options);
  }
}
