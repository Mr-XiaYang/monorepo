import { BaseField, BaseFieldOptions, isFieldOptions } from "base/field";

export interface PasswordFieldOptions<T, V> extends BaseFieldOptions<T, V> {
    type: 'password'
}

export function isPasswordFieldOptions(options: any): options is PasswordFieldOptions<any, any> {
    return isFieldOptions(options) && options.type === 'text'
}

export class PasswordField<T, V> extends BaseField<T, V> {
    constructor(options: PasswordFieldOptions<T, V>) {
        super(options)
    }
}