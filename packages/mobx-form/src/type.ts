type DeepReadonlyArray<T> = ReadonlyArray<DeepReadonly<T>>
type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

export type DeepReadonly<T> =
  T extends (infer R)[] ? DeepReadonlyArray<R> :
    T extends object ? DeepReadonlyObject<T> :
      T extends Function ? T :
        T;


type BaseValueType = string | number | bigint | boolean | null | symbol | Date | Function

export type DeepPartial<T> =
  T extends BaseValueType ? T | undefined :

    T extends Set<infer SetType> ? Set<DeepPartial<SetType>> :
      T extends Array<infer ArrayType> ? Array<DeepPartial<ArrayType>> :
        T extends Map<infer KeyType, infer ValueType> ? Map<KeyType, DeepPartial<ValueType>> :

          T extends ReadonlySet<infer SetType> ? ReadonlySet<SetType> :
            T extends ReadonlyMap<infer KeyType, infer ValueType> ? ReadonlyMap<KeyType, ValueType> :
              T extends ReadonlyArray<infer ArrayType> ? ReadonlyArray<ArrayType> :

                T extends Object ? { [K in keyof T]?: DeepPartial<T[K]> } :
                  T


export type Merge<T, Other> = T & Other
