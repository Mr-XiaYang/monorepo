interface Array<T> {
  orderByDesc(...mappers: ((v: T) => any)[]): Array<T>;
}

