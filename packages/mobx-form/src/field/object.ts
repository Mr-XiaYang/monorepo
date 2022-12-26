import { Form as FormInterface } from "../form";
import { makeField } from "../utils";
import { BaseNestedField, BaseNestedFieldOptions } from "./base";
import type { FieldOptions, FieldType } from "./index";
import { FieldValue } from "./index";

export interface ObjectFieldOptions extends BaseNestedFieldOptions {
  type: "object",
  childrenFields: Record<string, FieldOptions>
}

export class ObjectField<Form extends FormInterface<any>, Options extends ObjectFieldOptions> extends BaseNestedField<Form, Options> {
  public readonly children: {
    readonly [K in keyof Options["childrenFields"]]: FieldType<Form, Options["childrenFields"][K]>
  };

  public get value(): FieldValue<Options> {
    return this.emptyValue;
  }

  public set value(value: FieldValue<Options>) {

  }

  constructor(form: Form, options: Options) {
    super(form, options, {emptyValue: {} as NonNullable<FieldValue<Options>>});
    const emptyValue = this.config.emptyValue as Record<string, any>;
    this.children = Object.keys(options.childrenFields).reduce((fields, key) => {
      const field = makeField(this.form, options.childrenFields[key]);
      emptyValue[key] = field.emptyValue;
      return {...fields, [key]: field};
    }, {} as { [K in keyof Options["childrenFields"]]: FieldType<Form, Options["childrenFields"][K]> });
  }

}
