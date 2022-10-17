function removeOne<T>(arr: T[], item: T): T[]
function removeOne<T>(arr: T[], filter: (v: T, i: number, arr: T[]) => boolean): T[]
function removeOne<T>(arr: T[], filter: (v: T, i: number, arr: T[]) => boolean | T): T[] {
  if (typeof filter === "function") {
    for (let i = arr.length - 1; i > -1; --i) {
      if (filter(arr[i], i, arr)) {
        arr.splice(i, 1);
        return arr;
      }
    }
  } else {
    for (let i = arr.length - 1; i > -1; --i) {
      if (arr[i] === filter) {
        arr.splice(i, 1);
        return arr;
      }
    }
  }

  return arr;
}

export default removeOne;
