import { BaseInputField, BaseInputFieldOptions, isFieldOptions } from "../base/field";

export type BooleanFieldOptions<T extends Record<string, any>, V> =
  & BaseInputFieldOptions<T, V>
  & { type: "boolean" }

export function isBooleanFieldOptions<T extends Record<string, any>, V>(options: any): options is BooleanFieldOptions<T, V> {
  return isFieldOptions(options) && options.type === "boolean";
}

export class BooleanField<T extends Record<string, any>, V> extends BaseInputField<T, BooleanFieldOptions<T, V>, V> {
  protected readonly emptyValue = false as V;
}
