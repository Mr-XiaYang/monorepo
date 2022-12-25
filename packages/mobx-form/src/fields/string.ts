import { BaseInputField, BaseInputFieldOptions, isFieldOptions } from "../interface/field/field";

export type StringFieldOptions<T, V> =
  & BaseInputFieldOptions<T, V>
  & {
  type: "string";
  variant?: "text" | "password" | "telephone" | "email" | "url";
}

export function isStringFieldOptions<T extends Record<string, any>, V>(options: any): options is StringFieldOptions<T, V> {
  return isFieldOptions(options) && options.type === "string";
}

export class StringField<T extends Record<string, any>, V> extends BaseInputField<T, StringFieldOptions<T, V>, V> {
  protected readonly emptyValue = "" as V;

  public init(defaultValue?: V): void {

  }
}



