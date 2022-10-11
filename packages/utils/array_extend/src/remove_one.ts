/// <reference path="../types/remove_one.d.ts" />

if (!Array.prototype.removeOne) {
  Array.prototype.removeOne = function (this: any[], filter: (v: any, i: any, arr: any) => boolean | any): any[] {
    if (typeof (filter) == "function") {
      for (let i = this.length - 1; i > -1; --i) {
        if (filter(this[i], i, this)) {
          this.splice(i, 1);
          return this;
        }
      }
    } else {
      for (let i = this.length - 1; i > -1; --i) {
        if (this[i] === filter) {
          this.splice(i, 1);
          return this;
        }
      }
    }

    return this;
  };
}
