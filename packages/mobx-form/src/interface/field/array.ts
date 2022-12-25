import { BaseNestedField, BaseNestedFieldOptions } from "./base";
import type { FieldOptions } from "./index";
import { Form as FormInterface, Form } from "../form";

export interface ArrayFieldOptions extends BaseNestedFieldOptions {
  type: "array",
  childrenFields: FieldOptions
}

export interface ArrayField<Form extends FormInterface<any>, Options extends ArrayFieldOptions> extends BaseNestedField<Form, Options> {

}
