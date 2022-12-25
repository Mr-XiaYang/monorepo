import {  BaseInputField, BaseInputFieldOptions, isFieldOptions } from "../interface/field/field";

export type NumberFieldOptions<T extends Record<string, any>, V> =
  & BaseInputFieldOptions<T, V>
  & { type: "number"; }

export function isNumberFieldOptions<T extends Record<string, any>, V>(options: any): options is NumberFieldOptions<T, V> {
  return isFieldOptions(options) && options.type === "number";
}

export class NumberField<T extends Record<string, any>, V> extends BaseInputField<T, NumberFieldOptions<T, V>, V> {
  protected readonly emptyValue = 0 as V;
}
