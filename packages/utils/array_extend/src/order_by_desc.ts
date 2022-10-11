/// <reference path="../types/order_by_desc.d.ts" />

if (!Array.prototype.orderByDesc) {
  Array.prototype.orderByDesc = function (this: any[], ...mappers: ((v: any) => any)[]) {
    return this.slice().sort((a: any, b: any) => {
      for (let i = 0; i < mappers.length; ++i) {
        let va = mappers[i](a);
        let vb = mappers[i](b);
        if (typeof va === "string" && typeof vb === "string") {
          let res = va.localeCompare(vb);
          if (res !== 0) {
            return -res;
          }
        } else if (va > vb) {
          return -1;
        } else if (va < vb) {
          return 1;
        }
      }
      return 0;
    });
  };
}
