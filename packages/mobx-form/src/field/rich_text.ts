import { Form as FormInterface } from "../form";
import { BaseInputField, BaseInputFieldOptions } from "./base";
import { FieldValue } from "./index";
import { PasswordFieldOptions } from "./password";


export interface RichTextFieldOptions extends BaseInputFieldOptions {
  type: "rich-text";
}

export class RichTextField<Form extends FormInterface<any>, Options extends RichTextFieldOptions> extends BaseInputField<Form, Options> {
  constructor(form: Form, options: Options) {
  super(form, options, {
    emptyValue: "" as NonNullable<FieldValue<Options>>,
  });
}
}
