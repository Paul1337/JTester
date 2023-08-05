# This is a simple node.js library for creating unit tests. 
With support of run-time unit-testing.

## Getting started
Basic example (one test in a block):
```js
const { expect, test } = require('JTester');
test('Math', expect(2 * 2).toBe(4));
```
or using es modules (type="module" or typecsript / webpack compilation)
```js
import { expect, test } from 'JTester';
test('Math', expect(2 * 2).toBe(4));
```

Several tests in a named block:
```js
test('Math', [
  expect(2 * 2).toBe(4),
  expect(5 - 3).toBe(2),
  expect(1002).toBeCloseTo(1002.00035),
]);
```

Printing global result:

```js
import { expect, test, afterAll, printResult } from 'JTester';
test('Math', [
  expect(2 * 2).toBe(4),
  expect(5 - 3).toBe(2),
  expect(1002).toBeCloseTo(1002.00035),
]);
afterAll(printResult);
```

## API
`expect(value: any) => Expectation;`  
  
Expectation methods:
- `toBe(value: any)`  
Checks like a '==' (idential object, but not strict with types, NaN != NaN)

- `toBeStrict(value: any)`  
Strictly checks (like a '===' but considers NaN == NaN, using Object.is, but +0 will be considered equal to -0, in Object.is they are not)

- `toEqual(value: any)`  
Actually compares 2 values, if objects - recursively iterating properties. For primitive properties uses toBe() to compare

- `toEqualStrict(value: any)`  
Actually compares 2 values, if objects - recursively iterating properties. For primitive properties uses toBeStrict() to compare

- `toBeCloseTo(value: number, digits = 2)`  
Used to compare floating point numbers with precision given in the second agrument

- `toHaveProperty(keyPath, value, strict = false])`  
Checks if object has property given in keyPath (in format of string where properties are divided by dots: "first.pos.x"). If value is specified, than tries to compare that property with value using toEqual or toEqualStrict depending on third argument "strict", which is false by default

- `toContain(item)`  
Checks that value contains item, it works for string to check substring and for Array to check if array includes that item

And more:
- `toBeDefined()`
- `toBeUndefined()`
- `toBeNull()`
- `toBeTruthy()`
- `toBeNaN()`

Above methods return *ExpectationResult*, with which test() function works natively. 
If you just want to get boolean true / false, you could use any of that function preceded with underscore:  
lik ```_toBe(value: any): boolean;```
```
ExpectationResult {
  state: boolean;
  recieved: any;
  expected: any;
  expectAction: string;
  isInversed: boolean;
}
```
