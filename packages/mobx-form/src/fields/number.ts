import { BaseField, BaseFieldOptions, isFieldOptions } from "../base/field";
import { Form } from "../form";

export interface NumberFieldOptions<T extends Record<string, any>, V extends number> extends BaseFieldOptions<T, V> {
  type: "number";
}

export function isNumberFieldOptions(options: any): options is NumberFieldOptions<any, any> {
  return isFieldOptions(options) && options.type === "number";
}

export class NumberField<T extends Record<string, any>, V extends number> extends BaseField<T, V> {

  constructor(form: Form<T>, options: NumberFieldOptions<T, V>) {
    super(form, options);
  }
}
