import { Form as FormInterface } from "../form";
import { Merge } from "../type";
import { FieldValue } from "./index";


export interface BaseFieldOptions {
  type: unknown;
  optional?: true | false;
  allowNull?: true | false;
}

interface BaseFieldConfig<Options extends BaseFieldOptions> {
  emptyValue: NonNullable<FieldValue<Options>>;
}

export abstract class BaseField<Form, Options extends BaseFieldOptions, Config extends BaseFieldConfig<Options>> {
  protected readonly form: Form;
  protected readonly options: Merge<Options, { id: string }>;
  protected readonly config: Config;

  protected constructor(form: Form, options: Merge<Options, { id: string }>, config: Config) {
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

export interface BaseNestedFieldConfig<Options extends BaseFieldOptions> extends BaseFieldConfig<Options> {

}

export abstract class BaseNestedField<Form extends FormInterface<any>, Options extends BaseNestedFieldOptions> extends BaseField<Form, Options, Required<BaseNestedFieldConfig<Options>>> {
  abstract children: unknown;
}


export interface BaseInputFieldOptions extends BaseFieldOptions {

}

export interface BaseInputFieldConfig<Options extends BaseFieldOptions> extends BaseFieldConfig<Options> {
}

export abstract class BaseInputField<Form extends FormInterface<any>, Options extends BaseInputFieldOptions> extends BaseField<Form, Options, Required<BaseInputFieldConfig<Options>>> {
  protected readonly state: {
    defaultValue: FieldValue<Options>
    currentValue: FieldValue<Options>
  };

  get changed() {
    return this.state.currentValue != this.state.defaultValue;
  }

  protected constructor(form: Form, options: Merge<Options, { id: string }>, config: BaseInputFieldConfig<Options>) {
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



