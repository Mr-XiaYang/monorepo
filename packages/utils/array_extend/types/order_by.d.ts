interface Array<T> {
  orderBy(...mappers: ((v: T) => any)[]): Array<T>;
}

