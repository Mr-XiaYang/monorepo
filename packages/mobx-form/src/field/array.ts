import { Form as FormInterface } from "../form";
import { Merge } from "../type";
import { makeField } from "../utils";
import { BaseNestedField, BaseNestedFieldOptions } from "./base";
import type { FieldOptions, FieldValue } from "./index";
import { FieldType } from "./index";

export interface ArrayFieldOptions extends BaseNestedFieldOptions {
  type: "array",
  childrenFields: FieldOptions
}

export class ArrayField<Form extends FormInterface<any>, Options extends ArrayFieldOptions> extends BaseNestedField<Form, Options> {
  public readonly children: Array<FieldType<Form, Options["childrenFields"]>>;

  public get value(): FieldValue<Options> {
    return this.children.length ? this.children.map(child => child.value) as FieldValue<Options> : this.emptyValue;
  }

  public set value(value: FieldValue<Options>) {
    value.map((v) => this.insert(v as FieldValue<Options["childrenFields"]>, "last"));
  }

  constructor(form: Form, options: Merge<Options, { id: string }>) {
    super(form, options, {
      emptyValue: [] as NonNullable<FieldValue<Options>>,
    });
    this.children = [];
  }

  swapIndex(x: number, y: number): void {
    this.children.splice(x, 1, ...this.children.splice(y, 1, this.children[x]));
  }

  insert(value: FieldValue<Options["childrenFields"]>, position: "first" | "last" | number = "last"): void {
    const index = position === "first" ? 0 : position === "last" ? this.children.length : position;
    const child = makeField<Form, Options["childrenFields"]>(this.form, {
      id: `${this.options.id}[]`, ...this.options.childrenFields,
    });
    child.value = value;
    this.children.splice(index, 0, child);
  }

  remove(index: number): void {
    this.children.splice(index, 1);
  }
}
