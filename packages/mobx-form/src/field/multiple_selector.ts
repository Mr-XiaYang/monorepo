import { Form as FormInterface } from "../form";
import { BaseInputField, BaseInputFieldOptions } from "./base";
import { FieldValue } from "./index";

export interface MultipleSelectorFieldOptions extends BaseInputFieldOptions {
  type: "multiple-selector";
  availableValues: [label: string, value: unknown][];
}


export class MultipleSelectorField<Form extends FormInterface<any>, Options extends MultipleSelectorFieldOptions> extends BaseInputField<Form, Options> {
  constructor(form: Form, options: Options) {
    super(form, options, {
      emptyValue: [] as NonNullable<FieldValue<Options>>,
    });
  }
}
