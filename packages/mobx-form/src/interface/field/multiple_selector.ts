import { Form as FormInterface } from "../form";
import { BaseInputField, BaseInputFieldOptions } from "./base";
import { IntegerFieldOptions } from "./integer";

export interface MultipleSelectorFieldOptions extends BaseInputFieldOptions {
  type: "multiple-selector";
  availableValues: [label: string, value: unknown][];
}


export interface MultipleSelectorField<Form extends FormInterface<any>, Options extends MultipleSelectorFieldOptions> extends BaseInputField<Form, Options> {

}
