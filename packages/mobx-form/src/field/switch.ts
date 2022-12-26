import { Form as FormInterface } from "../form";
import { BaseInputField, BaseInputFieldOptions } from "./base";
import { FieldValue } from "./index";


export interface SwitchFieldOptions extends BaseInputFieldOptions {
  type: "switch";
}

export class SwitchField<Form extends FormInterface<any>, Options extends SwitchFieldOptions> extends BaseInputField<Form, Options> {
  constructor(form: Form, options: Options) {
    super(form, options, {
      emptyValue: false as NonNullable<FieldValue<Options>>,
    });
  }
}
