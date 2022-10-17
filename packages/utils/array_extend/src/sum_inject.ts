/// <reference path="../types/sum.d.ts" />

import sum from "./sum";

if (!Array.prototype.sum) {
  Array.prototype.sum = function (this: any[], mapper?: (v: any, i: number, arr: any[]) => number): number {
    return sum(this, mapper);
  };
}

