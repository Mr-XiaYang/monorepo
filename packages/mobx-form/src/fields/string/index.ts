import type { EmailFieldOptions } from "./email";
import type { PasswordFieldOptions } from "./password";
import type { TextFieldOptions } from "./text";

export * from "./email"
export * from "./password"
export * from "./text"

export type StringFieldOptions<T, V> =
  | TextFieldOptions<T, V>
  | PasswordFieldOptions<T, V>
  | EmailFieldOptions<T, V>
