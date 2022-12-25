import { Form as FormInterface } from "../form";
import { BaseInputField, BaseInputFieldOptions, BaseNestedField } from "./base";
import { MultipleSelectorFieldOptions } from "./multiple_selector";
import { ObjectFieldOptions } from "./object";

export interface PasswordFieldOptions extends BaseInputFieldOptions {
  type: "password";
}

export interface PasswordField<Form extends FormInterface<any>, Options extends PasswordFieldOptions> extends BaseInputField<Form, Options> {

}
