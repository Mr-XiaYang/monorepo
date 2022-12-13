import { BaseNestedField, BaseNestedFieldOptions, isFieldOptions } from "../../base/field";
import { Form } from "../../form";
import { DeepPartial } from "../../type";
import { makeField } from "../../utils";
import { Field, FieldOptions } from "../index";

type ArrayType<T> = T extends Array<infer V> ? V : never;

export type ArrayFieldOptions<T extends Record<string, any>, V> =
  & BaseNestedFieldOptions<T, V>
  & { type: "array", childrenFields: FieldOptions<T, ArrayType<V>> }

export function isArrayFieldOptions<T extends Record<string, any>, V>(options: any): options is ArrayFieldOptions<T, V> {
  return isFieldOptions(options) && options.type === "array";
}

export class ArrayField<T extends Record<string, any>, V> extends BaseNestedField<T, ArrayFieldOptions<T, V>, Array<Field<T, ArrayType<V>>>, V> {
  protected readonly emptyValue = [] as V;

  constructor(form: Form<T>, options: ArrayFieldOptions<T, V>) {
    super(form, options, []);
  }

  insert(defaultValue: DeepPartial<ArrayType<V>>, position: "first" | "last" | number = "first"): void {
    const child = makeField<T, ArrayType<V>>(this.form, this.options.childrenFields);
    if (position === "first") {
      this.children.splice(0, 0, child);
    } else if (position === "last") {
      this.children.splice(-1, 0, child);
    } else {
      this.children.splice(position, 0, child);
    }
  }

  swap(x: number, y: number): void {
    const temp = this.children[x];
    this.children.splice(x, 1, this.children[y]);
    this.children.splice(y, 1, temp);
  }

  delete(index: number): void {
    this.children.splice(index, 1);
  }
}
