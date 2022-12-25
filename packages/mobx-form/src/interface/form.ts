import { FieldOptions, FieldType } from "./field";

export interface FormOptions {
  fields: Record<string, FieldOptions>;
}

type FormFields<FormType extends Form<FormOptionsType>, FormOptionsType extends FormOptions> = {
  [K in keyof FormOptionsType["fields"]]: FieldType<FormType, FormOptionsType["fields"][K]>
}


export interface Form<Options extends FormOptions> {
  readonly options: Options;
  readonly fields: FormFields<this, Options>;

  readonly state: {
    valid: boolean
    changed: boolean
    focused: boolean
    blurred: boolean
  };

  clear(): void;

  reset(): void;

  submit(): void;
}



