/// <reference path="../types/group_by.d.ts" />

if (!Array.prototype.groupBy) {
  Array.prototype.groupBy = function (this: any[], grouper: (v: any) => string | number) {
    return Object.entries<any[] & { groupKey: string }>(this.reduce((previousValue, currentValue) => {
      let key = grouper(currentValue);
      if (!previousValue[key]) previousValue[key] = [];
      previousValue[key].push(currentValue);
      return previousValue;
    }, {})).map(([groupKey, value]) => {
      value.groupKey = groupKey;
      return value;
    });
  };
}
