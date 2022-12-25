import { BaseInputField, BaseInputFieldOptions, isFieldOptions } from "../interface/field/field";

export type PasswordFieldOptions<T, V> =
  & BaseInputFieldOptions<T, V>
  & {
  type: "password";
  variant?: "text" | "password" | "telephone" | "email" | "url";
}

export function isPasswordFieldOptions<T extends Record<string, any>, V>(options: any): options is PasswordFieldOptions<T, V> {
  return isFieldOptions(options) && options.type === "password";
}

export class PasswordField<T extends Record<string, any>, V> extends BaseInputField<T, PasswordFieldOptions<T, V>, V> {
  protected readonly emptyValue = "" as V;

  public init(defaultValue?: V): void {

  }
}



