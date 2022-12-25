import { Form as FormInterface } from "../form";
import { FieldValue } from "./index";

export interface BaseFieldOptions {
  type: unknown;
  optional?: true | false;
  allowNull?: true | false;
}

export interface BaseField<Form, Options> {
  readonly form: Form;
  readonly options: Options;

  get value(): FieldValue<Options>;
}


export interface BaseNestedFieldOptions extends BaseFieldOptions {
  childrenFields: unknown;
}

export interface BaseNestedField<Form extends FormInterface<any>, Options extends BaseNestedFieldOptions> extends BaseField<Form, Options> {
}


export interface BaseInputFieldOptions extends BaseFieldOptions {

}


export interface BaseInputField<Form extends FormInterface<any>, Options extends BaseInputFieldOptions> extends BaseField<Form, Options> {
}



