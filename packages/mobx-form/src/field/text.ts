import { Form as FormInterface } from "../form";
import { BaseInputField, BaseInputFieldOptions } from "./base";
import { FieldValue } from "./index";


export interface TextFieldOptions extends BaseInputFieldOptions {
  type: "text";
  variant?: "text" | "telephone" | "email" | "url";
}

export class TextField<Form extends FormInterface<any>, Options extends TextFieldOptions> extends BaseInputField<Form, Options> {
  constructor(form: Form, options: Options) {
    super(form, options, {
      emptyValue: "" as NonNullable<FieldValue<Options>>,
    });
  }
}
