# A simple node.js library for creating unit tests.

With support of run-time unit-testing.

## Getting started

Installation: `npm i jtester`

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
test('Math', [expect(2 * 2).toBe(4), expect(5 - 3).toBe(2), expect(0.4 + 0.2).toBeCloseTo(0.6)]);
```

Printing global result:

```js
import { expect, test, afterAll, printResult } from 'JTester';
test('Math', [expect(2 * 2).toBe(4), expect(5 - 3).toBe(2), expect(0.4 + 0.2).toBeCloseTo(0.6)]);
afterAll(printResult);
```

If you want to describe each test in a block, you can do it several ways:

```js
// passing object
test('Math', {
    Multiplication: expect(2 * 2).toBe(4),
    'Adding float numbers': expect(0.4 + 0.2).toBeCloseTo(0.6),
});
// passing array of arrays
test('Math', [
    ['Multiplication', expect(2 * 2).toBe(4)],
    ['Adding float numbers', expect(0.4 + 0.2).toBeCloseTo(0.6)],
]);
// also, you can descibe only some of tests (Not described ones will be numerated)
test('Math', [
    expect(2 * 2).toBe(4), // [expect(2 * 2).toBe(4)] would also be valid
    ['Adding float numbers', expect(0.4 + 0.2).toBeCloseTo(0.6)],
]);
```

Library supports methods to work with async functions like **toResolve**, and **toReject**, but you can also pass _Promise_ which returns **ExpectationResult** or rejects like this:

```js
test(
    'some async',
    asyncFunction().then((res) => expect(res).toBe('some res'))
);
```

## API

`expect(value: any) => Expectation;`

Expectation methods:

-   `toBe(value: any)`  
    Checks like a '==' (idential object, but not strict with types, NaN != NaN)

-   `toBeStrict(value: any)`  
    Strictly checks (like a '===' but considers NaN == NaN, using Object.is, but +0 will be considered equal to -0, in Object.is they are not)

-   `toEqual(value: any)`  
    Actually compares 2 values, if objects - recursively iterating properties. For primitive properties uses toBe() to compare

-   `toEqualStrict(value: any)`  
    Actually compares 2 values, if objects - recursively iterating properties. For primitive properties uses toBeStrict() to compare

-   `toBeCloseTo(value: number, digits = 2)`  
    Used to compare floating point numbers with precision given in the second agrument

-   `toHaveProperty(keyPath: string, value: any, strict = false)`  
    Checks if object has property given in keyPath (in format of string where properties are divided by dots: "first.pos.x"). If value is specified, than tries to compare that property with value using toEqual or toEqualStrict depending on third argument **strict**, which is false by default

-   `toContain(item: any)`  
    Checks that value contains item, it works for string to check substring and for Array to check if array includes that item

For testing async code:

-   `toResolve(value: any, strict = false)`
    Checks that the value is a promise and that it resolves. If a value is specified, than checks that it resolves in value, comparing using toEqual / toEqualStrict depending on **strict** argument

-   `toReject(value: any, strict = false)`
    Similar to **toResolve**

And more:

-   `toBeDefined()`
-   `toBeUndefined()`
-   `toBeNull()`
-   `toBeTruthy()`
-   `toBeNaN()`
-   `toBePromise()`

Also, we support **not** keyword to build inversed tests, like this:

```js
expect(10).not.toBe(20);
```

Above methods return _ExpectationResult_, with which test() function works natively.

```
ExpectationResult {
  state: boolean;
  recieved: any;
  expected: any;
  expectAction: string;
  isInversed: boolean;
}
```
