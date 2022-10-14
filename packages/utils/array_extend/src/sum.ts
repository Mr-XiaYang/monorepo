export function sum<T extends number>(arr: T[]): number
export function sum<T extends any>(arr: T[], mapper?: (V: T, i: number, arr: T[]) => number): number
export function sum<T extends any>(arr: T[], mapper?: (V: T, i: number, arr: T[]) => number): number {
  let result = 0;
  for (let i = 0; i < arr.length; ++i) {
    const temp = typeof mapper == "function" ? mapper(arr[i], i, arr) : arr[i];
    if (typeof temp === "number") {
      result = result + temp;
    }
  }
  return result;
}
