import { Form as FormInterface } from "../form";
import { Merge } from "../type";
import { BaseInputField, BaseInputFieldOptions } from "./base";
import { FieldValue } from "./index";

export interface PasswordFieldOptions extends BaseInputFieldOptions {
  type: "password";
}

export class PasswordField<Form extends FormInterface<any>, Options extends PasswordFieldOptions> extends BaseInputField<Form, Options> {

  constructor(form: Form, options: Merge<Options, { id: string }>) {
    super(form, options, {
      emptyValue: "" as NonNullable<FieldValue<Options>>,
    });
  }
}
