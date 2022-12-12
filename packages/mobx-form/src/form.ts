import { makeObservable, observable } from "mobx";
import { Field, FieldOptions } from "./fields";
import { makeField } from "./utils";

type Fields<T> = {
  [K in keyof T]: Field<T, T[K]>
}


type FormOptions<T> = {
  fields: {
    [K in keyof T]: FieldOptions<T, T[K]>
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
    this.fields = {} as Fields<T>;
    for (const key in options.fields) {
      // @ts-ignore
      this.fields[key] = makeField(this, options.fields[key]);
    }
    makeObservable<this, "fields">(this, {
      fields: observable,
    });
  }

  init() {
  }

  clear() {
  }

  reset() {

  }

  submit() {

  }
}







