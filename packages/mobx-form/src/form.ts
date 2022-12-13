import { makeObservable, observable } from "mobx";
import { Field, FieldOptions } from "./fields";
import { DeepPartial } from "./type";
import { makeFields } from "./utils";

type Fields<T extends Record<string, any>> = {
  [K in keyof T]-?: Field<T, T[K]>
}


type FormOptions<T extends Record<string, any>> = {
  fields: {
    [K in keyof T]-?: FieldOptions<T, T[K]>
  }
}


export class Form<T extends Record<string, any>> {
  readonly options: FormOptions<T>;
  readonly fields: Fields<T>;

  get valid() {
    return false;
  }

  get changed() {
    return false;
  }

  get readonly() {
    return false;
  }

  get focused() {
    return false;
  }

  get blurred() {
    return false;
  }

  constructor(options: FormOptions<T>) {
    this.options = options;
    this.fields = makeFields(this, options.fields);
    makeObservable<this, "fields">(this, {
      fields: observable,
    });
  }

  init(defaultValue: DeepPartial<T>) {
  }

  clear() {
  }

  reset() {

  }

  submit() {

  }
}







