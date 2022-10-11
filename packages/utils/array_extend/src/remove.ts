/// <reference path="../types/remove.d.ts" />

if (!Array.prototype.remove) {
  Array.prototype.remove = function (this: any[], filter: (v: any, i: any, arr: any) => boolean | any): any[] {
    if (typeof (filter) == "function") {
      for (let i = this.length - 1; i > -1; --i) {
        filter(this[i], i, this) && this.splice(i, 1);
      }
    } else {
      for (let i = this.length - 1; i > -1; --i) {
        this[i] === filter && this.splice(i, 1);
      }
    }

    return this;
  };
}
