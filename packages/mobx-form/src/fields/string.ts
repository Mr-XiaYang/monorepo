import { BaseInputField, BaseInputFieldOptions, isFieldOptions } from "../base/field";

export type StringFieldOptions<T extends Record<string, any>, V> =
  & BaseInputFieldOptions<T, V>
  & { type: "string"; }

export function isStringFieldOptions<T extends Record<string, any>, V>(options: any): options is StringFieldOptions<T, V> {
  return isFieldOptions(options) && options.type === "string";
}

export class StringField<T extends Record<string, any>, V> extends BaseInputField<T, StringFieldOptions<T, V>, V> {
  protected readonly emptyValue = "" as V;

  public init(defaultValue?: V): void {

  }
}
