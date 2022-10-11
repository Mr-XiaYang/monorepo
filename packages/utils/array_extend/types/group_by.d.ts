interface Array<T> {
  groupBy(grouper: (item: T) => string | number): (T[] & { groupKey: string | number })[];
}

