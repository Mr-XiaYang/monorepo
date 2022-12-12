import { BooleanField, BooleanFieldOptions, isBooleanFieldOptions } from "./boolean";

import { ArrayField, ArrayFieldOptions, isArrayFieldOptions } from "./nested/array";
import { isMapFieldOptions, MapField, MapFieldOptions } from "./nested/map";
import { isObjectFieldOptions, ObjectField, ObjectFieldOptions } from "./nested/object";
import { isSetFieldOptions, SetField, SetFieldOptions } from "./nested/set";
import { isNumberFieldOptions, NumberField, NumberFieldOptions } from "./number";
import { isStringFieldOptions, StringField, StringFieldOptions } from "./string";

export type FieldOptions<T extends Record<string, any>, V> =
  V extends string ? StringFieldOptions<T, V> :
    V extends number ? NumberFieldOptions<T, V> :
      V extends boolean ? BooleanFieldOptions<T, V> :
        V extends Set<any> ? SetFieldOptions<T, V> :
          V extends Array<any> ? ArrayFieldOptions<T, V> :
            V extends Map<any, any> ? MapFieldOptions<T, V> :
              V extends object ? ObjectFieldOptions<T, V> :
                unknown

export type Field<T extends Record<string, any>, V> =
  V extends string ? StringField<T, V> :
    V extends number ? NumberField<T, V> :
      V extends boolean ? BooleanField<T, V> :
        V extends Set<any> ? SetField<T, V> :
          V extends Array<any> ? ArrayField<T, V> :
            V extends Map<any, any> ? MapField<T, V> :
              V extends object ? ObjectField<T, V> :
                unknown



