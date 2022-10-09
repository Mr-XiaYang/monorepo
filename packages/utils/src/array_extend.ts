declare global {
  interface Array<T> {
    remove(filter: (v: T, i: number, arr: Array<T>) => boolean): Array<T>;
    remove(filter: T): Array<T>;

    removeOne(filter: (v: T, i: number, arr: Array<T>) => boolean): Array<T>;
    removeOne(filter: T): Array<T>;

    first(): T;
    last(): T;

    max(): T;
    max<P>(mapper: (v: T, i: number, arr: this) => P): P | null;

    min(): T;
    min<P>(mapper: (v: T, i: number, arr: this) => P): P | null;

    distinct(): Array<T>;
    filterIndex(filter: (v: T, i: number, arr: this) => boolean): Array<number>;

    count(filter: (v: T, i: number, arr: this) => boolean): number;
    sum(mapper?: (v: T, i: number, arr: this) => number): number;
    average(mapper?: (v: T, i: number, arr: this) => number): number;

    /**
     * 同find，但返回整个Array<T>中最后一个匹配元素
     */
    findLast(predicate: (value: T, index: number, obj: Array<T>) => boolean): T | undefined;
    /**
     * 同find，但返回整个Array<T>中最后一个匹配元素的index
     */
    findLastIndex(predicate: (value: T, index: number, obj: Array<T>) => boolean): number;

    //排序 返回新的数组
    orderBy(...mappers: ((v: T) => any)[]): Array<T>;
    orderByDesc(...mappers: ((v: T) => any)[]): Array<T>;

    /**
     * 二分查找 前提是数组一定是有序的
     * @param value 要查找的值
     * @param keyMapper 要查找的值的mapper方法（默认为查找数组元素本身）
     * @return 查找到的index，查不到返回-1
     */
    binarySearch(value: number | string, keyMapper?: (v: T) => (number | string)): number;
    /**
     * 二分插入 前提是数组一定是有序的
     * @param item 要插入的值
     * @param keyMapper 二分查找时要查找的值的mapper方法（默认为查找数组元素本身）
     * @param unique 是否去重，如果为true，则如果数组内已经有值时不插入，返回已有值的number
     * @return 返回插入的index位置
     */
    binaryInsert(item: T, unique?: boolean): number;
    binaryInsert(item: T, keyMapper: (v: T) => (number | string), unique?: boolean): number;
    /**
     * 二分去重 前提是数组一定是有序的
     * @param keyMapper 二分查找时要查找的值的mapper方法（默认为查找数组元素本身）
     */
    binaryDistinct(keyMapper?: (v: T) => (number | string)): Array<T>;

    groupBy(grouper: (v: T) => any): (T[] & { key: any })[];
  }
}


const extendFuncs = {

  removeOne: function (this: any[], filter: (v: any, i: any, arr: any) => boolean | any): any[] {
    if (typeof (filter) == 'function') {
      for (let i = 0; i < this.length; ++i) {
        if (filter(this[i], i, this)) {
          this.splice(i, 1);
          return this;
        }
      }
    }
    else {
      for (let i = 0; i < this.length; ++i) {
        if (this[i] === filter) {
          this.splice(i, 1);
          return this;
        }
      }
    }

    return this;
  },

  first: function (this: any[]) {
    return this.length ? this[0] : null;
  },

  last: function (this: any[]) {
    return this.length ? this[this.length - 1] : null;
  },

  max: function <P>(this: any[], mapper?: (v: any, i: any, arr: any) => P): P | null {
    if (!this.length) {
      return null;
    }

    if (typeof (mapper) == 'function') {
      let max: P = mapper(this[0], 0, this);
      for (let i = 1; i < this.length; ++i) {
        let temp = mapper(this[i], i, this);
        max = temp > max ? temp : max;
      }
      return max;
    }
    else {
      return this.reduce((prev: any, cur: any) => prev > cur ? prev : cur);
    }
  },

  min: function <P>(this: any[], mapper?: (v: any, i: any, arr: any) => P): P | null {
    if (!this.length) {
      return null;
    }

    function _min(a: any, b: any) {
      return a < b ? a : b;
    }

    if (typeof (mapper) == 'function') {
      let min: P = mapper(this[0], 0, this);
      for (let i = 1; i < this.length; ++i) {
        let temp = mapper(this[i], i, this);
        min = temp < min ? temp : min;
      }
      return min;
    }
    else {
      return this.reduce((prev: any, cur: any) => _min(prev, cur));
    }
  },

  distinct: function (this: any[]) {
    return this.filter((v: any, i: number, arr: any[]) => arr.indexOf(v) === i);
  },

  filterIndex: function (this: any[], filter: any) {
    let output: number[] = [];
    for (let i = 0; i < this.length; ++i) {
      if (filter(this[i], i, this)) {
        output.push(i);
      }
    }
    return output;
  },

  count: function (this: any[], filter: (v: any, i: number, arr: any[]) => boolean): number {
    let result = 0;
    for (let i = 0; i < this.length; ++i) {
      if (filter(this[i], i, this)) {
        ++result;
      }
    }
    return result;
  },

  sum: function (this: any[], mapper?: (v: any, i: number, arr: any[]) => number): number {
    let result = 0;
    for (let i = 0; i < this.length; ++i) {
      result += mapper ? mapper(this[i], i, this) : this[i];
    }
    return result;
  },

  average: function (this: any[], mapper?: (v: any, i: number, arr: any[]) => number): number {
    return this.sum(mapper) / this.length;
  },

  orderBy: function (this: any[], ...mappers: any[]) {
    return this.slice().sort((a: any, b: any) => {
      for (let i = 0; i < mappers.length; ++i) {
        let va = mappers[i](a);
        let vb = mappers[i](b);
        if (va > vb) {
          return 1;
        }
        else if (va < vb) {
          return -1;
        }
      }
      return 0;
    });
  },

  orderByDesc: function (this: any[], ...mappers: any[]) {
    return this.slice().sort((a: any, b: any) => {
      for (let i = 0; i < mappers.length; ++i) {
        let va = mappers[i](a);
        let vb = mappers[i](b);
        if (va > vb) {
          return -1;
        }
        else if (va < vb) {
          return 1;
        }
      }
      return 0;
    });
  },

  binarySearch: function (this: any[], value: number | string, keyMapper?: (v: any) => (number | string)): number {
    let low = 0,
      high = this.length - 1;

    while (low <= high) {
      let mid = ((high + low) / 2) | 0;
      let midValue = keyMapper ? keyMapper(this[mid]) : this[mid];
      if (value === midValue) {
        return mid;
      } else if (value > midValue) {
        low = mid + 1;
      } else if (value < midValue) {
        high = mid - 1;
      }
    }
    return -1;
  },

  binaryInsert: function (this: any[], item: any, keyMapper?: any, unique?: boolean): number {
    if (typeof (keyMapper) == 'boolean') {
      unique = keyMapper;
      keyMapper = undefined;
    }

    let low = 0, high = this.length - 1;
    let mid: number = NaN;
    let itemValue = keyMapper ? keyMapper(item) : item;

    while (low <= high) {
      mid = ((high + low) / 2) | 0;
      let midValue = keyMapper ? keyMapper(this[mid]) : this[mid];
      if (itemValue === midValue) {
        if (unique) {
          return mid;
        }
        else {
          break;
        }
      } else if (itemValue > midValue) {
        low = mid + 1;
      } else if (itemValue < midValue) {
        high = mid - 1;
      }
    }
    let index = low > mid ? mid + 1 : mid;
    this.splice(index, 0, item);
    return index;
  },

  binaryDistinct: function (this: any[], keyMapper?: (v: any) => (number | string)) {
    return this.filter((v: any, i: number, arr: any[]) => arr.binarySearch(v, keyMapper) === i);
  },

  findLast: function (this: any[], predicate: (value: any, index: number, obj: Array<any>) => boolean): any | undefined {
    for (let i = this.length - 1; i > -1; --i) {
      if (predicate(this[i], i, this)) {
        return this[i];
      }
    }
    return undefined;
  },

  findLastIndex: function (this: any[], predicate: (value: any, index: number, obj: Array<any>) => boolean): number {
    for (let i = this.length - 1; i > -1; --i) {
      if (predicate(this[i], i, this)) {
        return i;
      }
    }
    return -1;
  },

  groupBy: function (this: any[], grouper: (v: any) => string): any[] & { key: any } {
    let group = this.reduce((prev: any, next: any) => {
      let groupKey = grouper(next);
      if (!prev[groupKey]) {
        prev[groupKey] = [];
      }
      prev[groupKey].push(next)
      return prev;
    }, {});
    return Object.keys(group).map(key => {
      let arr = group[key];
      arr.key = key;
      return arr;
    }) as any
  },

  __k8w_extended: {
    value: true
  }
};

export {}
