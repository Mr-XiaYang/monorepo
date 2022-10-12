/// <reference path="../types/min.d.ts" />

if (!Array.prototype.min) {
  Array.prototype.min = function (this: any[], mapper?: (v: any, i: any, arr: any) => number): number | null {
    if (!this.length) {
      return null;
    }
    let min;
    let minIndex;

    for (let i = 0; i < this.length; ++i) {
      let temp = typeof mapper == "function" ? mapper(this[i], i, this) : this[i];
      if (typeof temp === "number") {
        if (min === undefined || temp < min) {
          min = temp;
          minIndex = i;
        }
      }
    }
    return minIndex !== undefined ? this[minIndex] : null;
  };
}
