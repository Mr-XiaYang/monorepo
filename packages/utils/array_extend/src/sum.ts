/// <reference path="../types/sum.d.ts" />

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
