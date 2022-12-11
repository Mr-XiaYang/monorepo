import isPlainObject from "lodash/isPlainObject";

export interface BaseFieldOptions<T, V> {
  type: string;
}

export function isFieldOptions(options: any): options is BaseFieldOptions<any, any> {
  return isPlainObject(options) && options.type != null;
}


export class BaseField<T, V> {
  constructor(options: BaseFieldOptions<T, V>) {
    const {type} = options;
  }
}
