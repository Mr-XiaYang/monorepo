interface Array<T> {
  min(): T extends number ? T | null : null;

  min(mapper: (v: T, i: number, arr: this) => number): T | null;
}

