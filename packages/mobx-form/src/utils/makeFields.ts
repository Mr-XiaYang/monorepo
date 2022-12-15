import { Field, FieldOptions } from "../fields/type";
import { BooleanField, isBooleanFieldOptions } from "../fields/boolean";
import { ArrayField, isArrayFieldOptions } from "../fields/nested/array";
import { isMapFieldOptions, MapField } from "../fields/nested/map";
import { isObjectFieldOptions, ObjectField } from "../fields/nested/object";
import { isSetFieldOptions, SetField } from "../fields/nested/set";
import { isNumberFieldOptions, NumberField } from "../fields/number";
import { isStringFieldOptions, StringField } from "../fields/string";
import type { Form } from "../form";


export function makeField<T extends Record<string, any>, V>(form: Form<T>, fieldOptions: any): Field<T, V> {
  if (isStringFieldOptions<T, V>(fieldOptions)) {
    return new StringField<T, V>(form, fieldOptions) as Field<T, V>;
  } else if (isNumberFieldOptions<T, V>(fieldOptions)) {
    return new NumberField<T, V>(form, fieldOptions) as Field<T, V>;
  } else if (isBooleanFieldOptions<T, V>(fieldOptions)) {
    return new BooleanField<T, V>(form, fieldOptions) as Field<T, V>;
  } else if (isSetFieldOptions<T, V>(fieldOptions)) {
    return new SetField<T, V>(form, fieldOptions) as Field<T, V>;
  } else if (isMapFieldOptions<T, V>(fieldOptions)) {
    return new MapField<T, V>(form, fieldOptions) as Field<T, V>;
  } else if (isArrayFieldOptions<T, V>(fieldOptions)) {
    return new ArrayField<T, V>(form, fieldOptions) as Field<T, V>;
  } else if (isObjectFieldOptions<T, V>(fieldOptions)) {
    return new ObjectField<T, V>(form, fieldOptions) as Field<T, V>;
  } else {
    throw new Error("unknown type");
  }
}

export function makeFields<T extends Record<string, any>, V>(
  form: Form<T>, fieldsOptions: { [K in keyof V]: FieldOptions<T, V[K]> },
) {
  const fields: Record<string, any> = {};
  for (const key in fieldsOptions) {
    fields[key] = makeField(form, fieldsOptions[key]);
  }
  return fields as { [K in keyof V]-?: Field<T, V[K]> };
}
