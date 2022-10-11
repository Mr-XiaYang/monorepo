interface Array<T> {
  filterIndex(filter: (v: T, i: number, arr: this) => boolean): Array<number>;
}

