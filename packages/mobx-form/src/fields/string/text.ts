import { BaseField, BaseFieldOptions, isFieldOptions } from "base/field";

export interface TextFieldOptions<T, V> extends BaseFieldOptions<T, V> {
    type: 'text'
}

export function isTextFieldOptions(options: any): options is TextFieldOptions<any, any> {
    return isFieldOptions(options) && options.type === 'text'
}

export class TextField<T, V> extends BaseField<T, V> {
    constructor(options: TextFieldOptions<T, V>) {
        super(options)
    }
}