export interface BaseFieldOptions<T extends object, K extends keyof T> {
  name: K extends string ? K : never,
  column?: string,
  type:
    | "char" | "varchar" | "text"
    | "float" | "double"
    | "int8" | "int16" | "int32" | "int64"
    | "uint8" | "uint16" | "uint32" | "uint64";
  readonly?: boolean,
  required?: boolean,
}

export default class BaseField<T extends object, K extends keyof T, Options extends BaseFieldOptions<T, K>> {
  protected readonly options: Options;

  constructor(options: Options) {
    this.options = options;
  }
}
