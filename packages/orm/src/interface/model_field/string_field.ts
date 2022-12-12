import BaseField, { BaseFieldOptions } from "./base_field";

export interface NumberFieldOptions<T extends object, K extends keyof T> extends BaseFieldOptions<T, K> {
  type:
    | "float" | "double"
    | "int8" | "int16" | "int32" | "int64"
    | "uint8" | "uint16" | "uint32" | "uint64";
}

export function isNumberFieldOptions(options: BaseFieldOptions<any, any>): options is NumberFieldOptions<any, any> {
  return ["float", "double", "int8", "int16", "int32", "int64", "uint8", "uint16", "uint32", "uint64"].includes(options.type);
}

export default class NumberField<T extends object, K extends keyof T> extends BaseField<T, K, Required<NumberFieldOptions<T, K>>> {
  constructor(options: NumberFieldOptions<T, K>) {
    super({column: options.name, readonly: false, required: false, ...options});
  }
}
