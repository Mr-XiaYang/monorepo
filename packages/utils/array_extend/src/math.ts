declare global {
  interface Array<T> {
    max(): T extends number ? T | null : null;
    max(mapper: (v: T, i: number, arr: this) => number): T | null;

    min(): T extends number ? T | null : null;
    min(mapper: (v: T, i: number, arr: this) => number): T | null;

    sum(): T extends number ? T | null : null;
    sum<P extends number>(mapper?: (v: T, i: number, arr: this) => P): P;

    average(): T extends number ? T | null : null;
    average<P extends number>(mapper?: (v: T, i: number, arr: this) => P): P;
  }
}

if (!Array.prototype.max) {
  Array.prototype.max = function (this: any[], mapper?: (v: any, i: any, arr: any) => number): number | null {
    if (!this.length) {
      return null;
    }

    let max;
    let maxIndex;

    for (let i = 0; i < this.length; ++i) {
      let temp = typeof mapper == "function" ? mapper(this[i], i, this) : this[i];
      if (max === undefined || temp > max) {
        max = temp;
        maxIndex = i;
      }
    }
    return maxIndex !== undefined ? this[maxIndex] : null;
  };
}

if (!Array.prototype.min) {
  Array.prototype.min = function (this: any[], mapper?: (v: any, i: any, arr: any) => number): number | null {
    if (!this.length) {
      return null;
    }
    let min;
    let minIndex;

    for (let i = 0; i < this.length; ++i) {
      let temp = typeof mapper == "function" ? mapper(this[i], i, this) : this[i];
      if (min === undefined || temp < min) {
        min = temp;
        minIndex = i;
      }
    }
    return minIndex !== undefined ? this[minIndex] : null;
  };
}

if (!Array.prototype.sum) {
  Array.prototype.sum = function (this: any[], mapper?: (v: any, i: number, arr: any[]) => number): number {
    let result = 0;
    for (let i = 0; i < this.length; ++i) {
      result = result + (
        typeof mapper == "function" ? mapper(this[i], i, this) : this[i]
      );
    }
    return result;
  };
}

if (!Array.prototype.average) {
  Array.prototype.average = function (this: any[], mapper?: (v: any, i: number, arr: any[]) => number): number {
    return this.sum(mapper) / this.length;
  };
}
