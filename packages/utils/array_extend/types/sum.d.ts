interface Array<T> {

  sum(): T extends number ? T | null : null;

  sum<P extends number>(mapper?: (v: T, i: number, arr: this) => P): P;
}

