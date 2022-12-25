import { Form as FormInterface } from "../form";
import { BaseInputField, BaseInputFieldOptions } from "./base";
import { PasswordFieldOptions } from "./password";


export interface TextFieldOptions extends BaseInputFieldOptions {
  type: "text";
  variant?: "text" | "telephone" | "email" | "url";
}

export interface TextField<Form extends FormInterface<any>, Options extends TextFieldOptions> extends BaseInputField<Form, Options> {

}
