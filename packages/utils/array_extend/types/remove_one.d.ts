
     interface Array<T> {
        removeOne(item: T): Array<T>;
        removeOne(filter: (v: T, i: number, arr: Array<T>) => boolean): Array<T>;
    }

