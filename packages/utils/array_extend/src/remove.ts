declare global {
  export interface Array<T> {
    remove(filter: T): Array<T>;
    remove(filter: (v: T, i: number, arr: Array<T>) => boolean): Array<T>;

    removeOne(filter: T): Array<T>;
    removeOne(filter: (v: T, i: number, arr: Array<T>) => boolean): Array<T>;

    removeDuplicate(): Array<T>;
  }
}

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

if (!Array.prototype.removeDuplicate) {
  Array.prototype.removeDuplicate = function (this: any[]) {
    return this.filter((v: any, i: number, arr: any[]) => arr.indexOf(v) === i);
  };
}
