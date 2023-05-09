import { FieldOptions, FieldType } from "../field";
import { ArrayField } from "../field/array";
import { ObjectField } from "../field/object";
import { PasswordField } from "../field/password";
import { TextField } from "../field/text";
import type { Form, FormOptions } from "../form";


export function makeField<T extends Form<FormOptions>, O extends FieldOptions>(form: T, options: O & { id: string }): FieldType<T, O> {
  if (options && options.type) {
    switch (options.type) {
      case "text":
        return new TextField(form, options) as FieldType<T, O>;
      case "password":
        return new PasswordField(form, options) as FieldType<T, O>;
      case "object":
        return new ObjectField(form, options) as FieldType<T, O>;
      case "array":
        return new ArrayField(form, options) as FieldType<T, O>;
    }
  }

  throw new Error("");
}

