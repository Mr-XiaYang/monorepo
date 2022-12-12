import { BaseField, BaseFieldOptions, isFieldOptions } from "../base/field";
import type { Form } from "../form";

export interface StringFieldOptions<T extends Record<string, any>, V extends string> extends BaseFieldOptions<T, V> {
  type: "string";
}

export function isStringFieldOptions(options: any): options is StringFieldOptions<any, any> {
  return isFieldOptions(options) && options.type === "string";
}

export class StringField<T extends Record<string, any>, V extends string> extends BaseField<T, V> {

  initValue:string = "" as V;

  constructor(form: Form<T>, options: StringFieldOptions<T, V>) {
    super(form, options);
  }
}
