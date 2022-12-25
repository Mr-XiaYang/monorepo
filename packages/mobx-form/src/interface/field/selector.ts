import { Form as FormInterface } from "../form";
import { BaseInputField, BaseInputFieldOptions } from "./base";
import { PasswordFieldOptions } from "./password";


export interface SelectorFieldOptions extends BaseInputFieldOptions {
  type: "selector";
  availableValues: [label: string, value: unknown][];
}


export interface SelectorField<Form extends FormInterface<any>, Options extends SelectorFieldOptions> extends BaseInputField<Form, Options> {

}
