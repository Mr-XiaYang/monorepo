/// <reference path="../types/max.d.ts" />

if (!Array.prototype.max) {
  Array.prototype.max = function (this: any[], mapper?: (v: any, i: any, arr: any) => number): number | null {
    if (!this.length) {
      return null;
    }

    let max;
    let maxIndex;

    for (let i = 0; i < this.length; ++i) {
      let temp = typeof mapper == "function" ? mapper(this[i], i, this) : this[i];
      if (typeof temp === "number" && (max === undefined || temp > max)) {
        max = temp;
        maxIndex = i;
      }
    }
    return maxIndex !== undefined ? this[maxIndex] : null;
  };
}

