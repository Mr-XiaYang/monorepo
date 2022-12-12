import type { Form } from "../form";
import { FieldOptions } from "../fields";
import { BooleanField, isBooleanFieldOptions } from "../fields/boolean";
import { ArrayField, isArrayFieldOptions } from "../fields/nested/array";
import { isMapFieldOptions, MapField } from "../fields/nested/map";
import { isObjectFieldOptions, ObjectField } from "../fields/nested/object";
import { isSetFieldOptions, SetField } from "../fields/nested/set";
import { isNumberFieldOptions, NumberField } from "../fields/number";
import { isStringFieldOptions, StringField } from "../fields/string";

export default function makeField<T extends Record<string, any>, V>(form: Form<T>, options: FieldOptions<T, V>) {
  if (isStringFieldOptions(options)) {
    return new StringField(form,options);
  } else if (isNumberFieldOptions(options)) {
    return new NumberField(form,options);
  } else if (isBooleanFieldOptions(options)) {
    return new BooleanField(form,options);
  } else if (isSetFieldOptions(options)) {
    return new SetField(form,options);
  } else if (isMapFieldOptions(options)) {
    return new MapField(form,options);
  } else if (isArrayFieldOptions(options)) {
    return new ArrayField(form,options);
  } else if (isObjectFieldOptions(options)) {
    return new ObjectField(form,options);
  } else {
    throw new Error("unknown type");
  }
}
