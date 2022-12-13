import isPlainObject from "lodash/isPlainObject";
import { makeObservable, observable } from "mobx";
import { Form } from "../form";

type BaseFieldOptions<Type, Value> =
  & { type: string; }
  & (undefined extends Value ? { optional: true } : { optional?: false })
  & (null extends Value ? { allowNull: true } : { allowNull?: false })

abstract class BaseField<Type extends Record<string, any>, Options extends BaseFieldOptions<Type, Value>, Value> {
  protected readonly form: Form<Type>;
  protected readonly options: Options;

  protected abstract readonly emptyValue: Value;

  public constructor(form: Form<Type>, options: Options) {
    this.form = form;
    this.options = options;
    makeObservable<this, "form">(this, {form: observable.ref});
  }
}

export function isFieldOptions(options: any): options is BaseFieldOptions<any, any> {
  return isPlainObject(options) && options.type != null;
}

export type BaseInputFieldOptions<Type, Value> =
  & BaseFieldOptions<Type, Value>

export abstract class BaseInputField<Type extends Record<string, any>, Options extends BaseInputFieldOptions<Type, Value>, Value> extends BaseField<Type, Options, Value> {
  protected defaultValue?: Value;
  private $value?:Value;

  get value(): Value {
    return this.$value ?? (
      this.options.allowNull ? null : this.options.optional ? undefined : this.emptyValue
    ) as Value;
  }

  set value(value: Value) {
    this.$value = value
  }

  get changed():boolean {
    return !!this.defaultValue && this.defaultValue !== this.value
  }

  changeValue(value: any) {
    this.value = value;
  }
}

export type BaseNestedFieldOptions<Type, Value> = & BaseFieldOptions<Type, Value>

export abstract class BaseNestedField<Type extends Record<string, any>, Options extends BaseNestedFieldOptions<Type, Value>, Children, Value> extends BaseField<Type, Options, Value> {
  protected children: Children;

  protected constructor(form: Form<Type>, options: Options, children: Children) {
    super(form, options);
    this.children = children;
    makeObservable<this, "children">(this, {children: observable});
  }
}
