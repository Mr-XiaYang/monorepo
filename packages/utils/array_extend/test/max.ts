import "../src/max";

const array = [{value: 10}, {value: 9}, {value: 8}, {value: -1}, {value: -3}, {value: -8}];
test("Test the max function for array extend.", () => {
  expect(array.max()).toBe(null);
  expect([...array, 0].max()).toBe(0);
  expect([1, 2, 3, 4, 0, -1].max()).toBe(4);
  expect(array.max(v => v.value)).toBe(array[0]);
  expect([5, 2, 3, 4, -1, 0].max((v, i) => v * i)).toBe(4);
  expect([5, 2, 3, 4, 0, -1].max((v, i, arr) => arr[i] + 1)).toBe(5);
});
