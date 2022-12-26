import { Form as FormInterface } from "../form";
import { FieldValue } from "./index";

export interface BaseFieldOptions {
  type: unknown;
  optional?: true | false;
  allowNull?: true | false;
}

type BaseFieldConfig<Options extends BaseFieldOptions> = {
  emptyValue: NonNullable<FieldValue<Options>>
}

export abstract class BaseField<Form, Options extends BaseFieldOptions> {
  protected readonly form: Form;
  protected readonly options: Options;
  protected readonly config: Required<BaseFieldConfig<Options>>;

  protected constructor(form: Form, options: Options, config: BaseFieldConfig<Options>) {
    this.form = form;
    this.options = options;
    this.config = config;
  }

  get emptyValue(): FieldValue<Options> {
    return (
      this.options.optional
        ? undefined : this.options.allowNull
          ? null : this.config.emptyValue
    ) as FieldValue<Options>;
  };

  abstract set value(value: FieldValue<Options>);
  abstract get value(): FieldValue<Options>;
}


export interface BaseNestedFieldOptions extends BaseFieldOptions {
  childrenFields: unknown;
}

export abstract class BaseNestedField<Form extends FormInterface<any>, Options extends BaseNestedFieldOptions> extends BaseField<Form, Options> {
  abstract children: unknown;
}


export interface BaseInputFieldOptions extends BaseFieldOptions {

}


export abstract class BaseInputField<Form extends FormInterface<any>, Options extends BaseInputFieldOptions> extends BaseField<Form, Options> {
  protected readonly state: {
    defaultValue: FieldValue<Options>
    currentValue: FieldValue<Options>
  };

  get changed() {
    return this.state.currentValue != this.state.defaultValue;
  }

  protected constructor(form: Form, options: Options, config: BaseFieldConfig<Options>) {
    super(form, options, config);
    this.state = {currentValue: this.emptyValue, defaultValue: this.emptyValue};
  }

  set value(value: FieldValue<Options>) {
    this.state.currentValue = value;
  }

  get value(): FieldValue<Options> {
    return this.state.currentValue ?? this.emptyValue;
  };

}



