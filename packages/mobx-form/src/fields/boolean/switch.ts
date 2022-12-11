import { BaseField, BaseFieldOptions, isFieldOptions } from "base/field";

export interface IntegerFieldOptions<T, V> extends BaseFieldOptions<T, V> {
    type: 'integer'
}

export function isIntegerFieldOptions(options: any): options is IntegerFieldOptions<any, any> {
    return isFieldOptions(options) && options.type === 'text'
}

export class IntegerField<T, V> extends BaseField<T, V> {
    constructor(options: IntegerFieldOptions<T, V>) {
        super(options)
    }
}