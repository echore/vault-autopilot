import { parseSelection } from '../src/frame-select';

test('parses a clean keep list', () => {
  expect(parseSelection('{"keep":[2,5,7]}', 3, 10)).toEqual([2, 5, 7]);
});

test('drops out-of-range and duplicate indices, then pads', () => {
  expect(parseSelection('{"keep":[2,2,99,5]}', 3, 10)).toEqual([2, 5, 0]);
});

test('pads with unused indices when the model returns too few', () => {
  expect(parseSelection('keep frame 3', 3, 10)).toEqual([3, 0, 1]);
});

test('falls back to the first N on a non-numeric reply', () => {
  expect(parseSelection('sorry, I cannot', 2, 5)).toEqual([0, 1]);
});

test('caps to count when the model returns too many', () => {
  expect(parseSelection('[1,2,3,4,5,6]', 3, 10)).toEqual([1, 2, 3]);
});
