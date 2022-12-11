import { NumberFieldOptions } from "./number";
import { StringFieldOptions } from "./string";

type Field<T, V> =
  V extends string ? StringFieldOptions<T, V> :
  V extends number ? NumberFieldOptions<T, V> :
  V extends boolean ? BooleanField<T, V> :
  V extends Set<infer SetType> ? SetField<T, SetType> :
  V extends Map<infer KeyType, infer MapType> ? MapField<T, KeyType, MapType> :
  V extends Array<infer ArrayType> ? ArrayField<T, ArrayType> :
  V extends object ? ObjectField<T, V> :
  unknown