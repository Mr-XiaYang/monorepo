/// <reference path="../types/average.d.ts" />
import "./sum";

if (!Array.prototype.average) {
  Array.prototype.average = function (this: any[], mapper?: (v: any, i: number, arr: any[]) => number): number {
    return this.sum(mapper) / this.length;
  };
}
