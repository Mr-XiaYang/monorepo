
     interface Array<T> {
        remove(filter: T): Array<T>;
        remove(filter: (v: T, i: number, arr: Array<T>) => boolean): Array<T>;
    }

