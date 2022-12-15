import { BooleanField, BooleanFieldOptions } from "./boolean";

import { ArrayField, ArrayFieldOptions } from "./nested/array";
import { MapField, MapFieldOptions } from "./nested/map";
import { ObjectField, ObjectFieldOptions } from "./nested/object";
import { SetField, SetFieldOptions } from "./nested/set";
import { NumberField, NumberFieldOptions } from "./number";
import { StringField, StringFieldOptions } from "./string";

export type FieldOptions<T extends Record<string, any>, V> =
  string extends V ? StringFieldOptions<T, V> :
    number extends V ? NumberFieldOptions<T, V> :
      boolean extends V ? BooleanFieldOptions<T, V> :
        Set<any> extends V ? SetFieldOptions<T, V> :
          Array<any> extends V ? ArrayFieldOptions<T, V> :
            Map<any, any> extends V ? MapFieldOptions<T, V> :
              object extends V ? ObjectFieldOptions<T, V> :
                unknown

export type Field<T extends Record<string, any>, V> =
  string extends V ? StringField<T, V> :
    number extends V ? NumberField<T, V> :
      boolean extends V ? BooleanField<T, V> :
        Set<any> extends V ? SetField<T, V> :
          Array<any> extends V ? ArrayField<T, V> :
            Map<any, any> extends V ? MapField<T, V> :
              object extends V ? ObjectField<T, V> :
                unknown



