import { BaseField, BaseFieldOptions, isFieldOptions } from "base/field";

export interface EmailFieldOptions<T, V> extends BaseFieldOptions<T, V> {
    type: 'email'
}

export function isEmailFieldOptions(options: any): options is EmailFieldOptions<any, any> {
    return isFieldOptions(options) && options.type === 'text'
}

export class EmailField<T, V> extends BaseField<T, V> {
    constructor(options: EmailFieldOptions<T, V>) {
        super(options)
    }
}