import { BaseField, isFieldOptions } from "../../base/field";
import { FieldOptions } from "../index";
import { Form } from "../../form";
type MapType<T> = T extends Map<infer K, infer V> ? V : never;

export type MapFieldOptions<T extends Record<string, any>, V extends Map<any, any>> = {
  type: "map",
  fields: FieldOptions<T, MapType<V>>
}

export function isMapFieldOptions(options: any): options is MapFieldOptions<any, any> {
  return isFieldOptions(options) && options.type === "array";
}

export class MapField<T extends Record<string, any>, V extends Map<any, any>> extends BaseField<T, V> {
  constructor(form: Form<T>,options: MapFieldOptions<T, V>) {
    super(form,options);
  }
}
