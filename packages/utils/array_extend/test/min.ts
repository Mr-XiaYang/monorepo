import "../src/min";

const array = [{value: 10}, {value: 9}, {value: 8}, {value: -1}, {value: -3}, {value: -8}];
test("Test the min function for array extend.", () => {
  expect(array.min()).toBe(null);
  expect([...array, 0].min()).toBe(0);
  expect([1, 2, 3, 4, 0, -1].min()).toBe(-1);
  expect(array.min(v => v.value)).toBe(array[5]);
  expect([1, 2, 3, 4, -1, 0].min((v, i) => v * i)).toBe(-1);
  expect([1, 2, 3, 4, 0, -1].min((v, i, arr) => arr[i] + 1)).toBe(-1);
});
