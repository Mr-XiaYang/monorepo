/// <reference path="../types/remove_one.d.ts" />

import removeOne from "./remove_one";

if (!Array.prototype.removeOne) {
  Array.prototype.removeOne = function (this: any[], filter: (v: any, i: any, arr: any) => boolean | any): any[] {
    return removeOne(this, filter);
  };
}
