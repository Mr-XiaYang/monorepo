import { FieldOptions, FieldType } from "./field";
import { makeField } from "./utils";

export interface FormOptions {
  fields: Record<string, FieldOptions>;
}

type FormFields<FormType extends Form<FormOptionsType>, FormOptionsType extends FormOptions> = {
  [K in keyof FormOptionsType["fields"]]: FieldType<FormType, FormOptionsType["fields"][K]>
}


export class Form<Options extends FormOptions> {
  readonly options: Options;
  readonly fields: FormFields<this, Options>;

  readonly state = {
    valid: false,
    changed: false,
    focused: false,
    blurred: false,
  };

  get value() {
    return Object.keys(this.fields).reduce((values, key) => ({...values, [key]: this.fields[key].value}), {});
  }

  constructor(options: Options) {
    this.options = options;
    this.fields = Object.keys(options.fields).reduce((fields, key) => ({
      ...fields, [key]: makeField(this, {id: key, ...options.fields[key]}),
    }), {} as FormFields<this, Options>);
  }

  clear(): void {
  };

  reset(): void {
  };

  submit(): void {
  };
}



