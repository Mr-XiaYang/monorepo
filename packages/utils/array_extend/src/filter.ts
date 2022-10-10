declare global {
  interface Array<T> {
    filterIndex(filter: (v: T, i: number, arr: this) => boolean): Array<number>;
  }
}

if (!Array.prototype.filterIndex) {
  Array.prototype.filterIndex = function (this: any[], filter: (v: any, i: number, arr: any[]) => boolean) {
    let output: number[] = [];
    for (let i = 0; i < this.length; ++i) {
      if (filter(this[i], i, this)) {
        output.push(i);
      }
    }
    return output;
  };
}
