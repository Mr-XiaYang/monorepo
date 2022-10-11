/// <reference path="../types/remove_duplicate.d.ts" />

if (!Array.prototype.removeDuplicate) {
  Array.prototype.removeDuplicate = function (this: any[]) {
    return this.filter((v: any, i: number, arr: any[]) => arr.indexOf(v) === i);
  };
}
