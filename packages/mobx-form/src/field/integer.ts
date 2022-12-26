import { Form as FormInterface } from "../form";
import { BaseInputField, BaseInputFieldOptions } from "./base";
import { FieldValue } from "./index";

export interface IntegerFieldOptions extends BaseInputFieldOptions {
  type: "number";
  variant?:
    | "int8" | "int16" | "int32" | "int64"
    | "uint8" | "uint16" | "uint32" | "uint64";
}

export class IntegerField<Form extends FormInterface<any>, Options extends IntegerFieldOptions> extends BaseInputField<Form, Options> {
  constructor(form: Form, options: Options) {
    super(form, options, {
      emptyValue: 0 as NonNullable<FieldValue<Options>>,
    });
  }

}
