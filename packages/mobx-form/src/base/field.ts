import isPlainObject from "lodash/isPlainObject";
import { makeObservable, observable } from "mobx";
import { Form } from "../form";

export interface BaseFieldOptions<T, V> {
  type: string;
  defaultValue: string;
}

export function isFieldOptions(options: any): options is BaseFieldOptions<any, any> {
  return isPlainObject(options) && options.type != null;
}


export abstract class BaseField<T extends Record<string, any>, V> {
  protected readonly form: Form<T>;
  inputValue: any;

  get value(): V | null {
    return null;
  }

  protected constructor(form: Form<T>, options: BaseFieldOptions<T, V>) {
    const {type} = options;
    this.form = form;

    makeObservable<this, "form">(this, {form: observable.ref});
  }
}
