interface Array<T> {

  average(): T extends number ? T | null : null;

  average<P extends number>(mapper?: (v: T, i: number, arr: this) => P): P;
}

