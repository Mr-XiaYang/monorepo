
    interface Array<T> {
        max(): T extends number ? T | null : null;
        max(mapper: (v: T, i: number, arr: this) => number): T | null;
    }

