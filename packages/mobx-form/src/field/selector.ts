import { Form as FormInterface } from "../form";
import { Merge } from "../type";
import { BaseInputField, BaseInputFieldOptions } from "./base";
import { FieldValue } from "./index";


export interface SelectorFieldOptions extends BaseInputFieldOptions {
  type: "selector";
  availableValues: [label: string, value: unknown][];
}


export class SelectorField<Form extends FormInterface<any>, Options extends SelectorFieldOptions> extends BaseInputField<Form, Options> {
  constructor(form: Form, options: Merge<Options, { id: string }>) {
    super(form, options, {
      emptyValue: options.availableValues[0][1] as NonNullable<FieldValue<Options>>,
    });
  }
}
