declare global {
  interface Array<T> {
    remove(filter: (v: T, i: number, arr: Array<T>) => boolean): Array<T>;
    remove(filter: T): Array<T>;
  }
}

if(!Array.prototype.remove) {
  Array.prototype.remove = function (this: any[], filter: (v: any, i: any, arr: any) => boolean | any): any[] {
    if (typeof (filter) == 'function') {
      for (let i = this.length - 1; i > -1; --i) {
        filter(this[i], i, this) && this.splice(i, 1);
      }
    }
    else {
      for (let i = this.length - 1; i > -1; --i) {
        this[i] === filter && this.splice(i, 1);
      }
    }

    return this;
  }
}

export {}
