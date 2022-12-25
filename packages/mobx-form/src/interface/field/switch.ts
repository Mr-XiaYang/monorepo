import { Form as FormInterface } from "../form";
import { BaseInputField, BaseInputFieldOptions } from "./base";
import { PasswordFieldOptions } from "./password";


export interface SwitchFieldOptions extends BaseInputFieldOptions {
  type: "switch";
}

export interface SwitchField<Form extends FormInterface<any>, Options extends SwitchFieldOptions> extends BaseInputField<Form, Options> {

}
