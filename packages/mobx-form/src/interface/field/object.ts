import { Form as FormInterface } from "../form";
import { BaseNestedField, BaseNestedFieldOptions } from "./base";
import type { FieldOptions, FieldType } from "./index";

export interface ObjectFieldOptions extends BaseNestedFieldOptions {
  type: "object",
  childrenFields: Record<string, FieldOptions>
}

export interface ObjectField<Form extends FormInterface<any>, Options extends ObjectFieldOptions> extends BaseNestedField<Form, Options> {
  children: {
    [K in keyof Options["childrenFields"]]: FieldType<Form, Options["childrenFields"][K]>
  };
}
