import { BaseNestedField, BaseNestedFieldOptions, isFieldOptions } from "../../interface/field/field";
import { Form } from "../../form";
import { FieldOptions } from "../type";

type MapKeyType<T> = T extends Map<infer K, infer V> ? V : never;
type MapValueType<T> = T extends Map<infer K, infer V> ? V : never;

export type MapFieldOptions<T extends Record<string, any>, V> =
  & BaseNestedFieldOptions<T, V>
  & { type: "map", childrenFields: FieldOptions<T, MapValueType<V>> }

export function isMapFieldOptions<T extends Record<string, any>, V>(options: any): options is MapFieldOptions<T, V> {
  return isFieldOptions(options) && options.type === "map";
}

export class MapField<T extends Record<string, any>, V> extends BaseNestedField<T, MapFieldOptions<T, V>, Map<MapKeyType<V>, FieldOptions<T, MapValueType<V>>>, V> {
  protected readonly emptyValue = new Map() as V;

  constructor(form: Form<T>, options: MapFieldOptions<T, V>) {
    super(form, options, new Map());
  }
}
