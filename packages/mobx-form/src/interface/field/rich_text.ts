import { Form as FormInterface } from "../form";
import { BaseInputField, BaseInputFieldOptions } from "./base";
import { PasswordFieldOptions } from "./password";


export interface RichTextFieldOptions extends BaseInputFieldOptions {
  type: "rich-text";
}

export interface RichTextField<Form extends FormInterface<any>, Options extends RichTextFieldOptions> extends BaseInputField<Form, Options> {

}
