# A simple node.js library for creating unit tests.

With support of run-time unit-testing & development unit-testing

## Getting started

Installation:

```bash
npm i jtester
```

## Run-time testing (as we call it)

Basic example (one test in a block):

_testFile.js_

```js
const { expect, test } = require('jtester');
test('Math', expect(2 * 2).toBe(4));
```

_to run tests as node.js script:_

```bash
node testFile.js
```

or using es modules (type="module" or typecsript / webpack compilation)

```js
import { expect, test } from 'jtester';
test('Math', expect(2 * 2).toBe(4));
```

Several tests in a named block:

```js
test('Math', [
    expect(2 * 2).toBe(4),
    expect(5 - 3).toBe(2),
    expect(0.4 + 0.2).toBeCloseTo(0.6),
]);
```

Printing global result:

```js
import { expect, test, afterAll, printResult } from 'JTester';
test('Math', [
    expect(2 * 2).toBe(4), 
    expect(5 - 3).toBe(2), 
    expect(0.4 + 0.2).toBeCloseTo(0.6)
]);
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

## In-dev testing

You can use jtester as a cli tool to test all files in directory that match pattern \*.test.js.
All you need is to install cli globally and run it:

```bash
npm i --location=global jtester
jtester
```

```js
// example.test.js
// no need to require jtester api in those files
test('string lowercase', expect('jTeSter'.toLowerCase()).toBe('jtester'));
```

You can configurate path option (--path / -p) to look in the other directory, than the current one.
You can use --help to see more details.

-   CLI tool runs all those test files in one environment providing JTESTER API functions in global context by default
-   You can use CJS or ESM module system in \*.test.js file, babel is used to handle import / export
-   You are going to see global result of all your test files, so you don't need `afterAll(printResult)` as you needed in run-time testing

## Configuration

Configuration is for cli tool.
There is a default configuration, which is used when you run `jsteter` without params.
You can override it by _jtester.config.js_ which should export config object (in cjs or esm as you like).
That file should be located in the place where you run `jtester`.
And that configuration may be overriden by cli options (highest priority).

-   Every option in cli command is described in --help and any of that option can be used in jtester.config.js file

**In jtester.config.js file there are some extra options available:**  

`globalContext: object` - An object in which you can put anything you want to be accessable globally in your .test.js files  
`before: function` - A hook, that is executed just before running test files  
`after: function` - A hook, that is executed just after running test files  

Example:  

```js
// jtester.config.js
export default {
    before: () => {
        // do something before testing
    },
    verbose: true, // show additional information when seaching *.test.js files
    globalContext: { // add something to global context in *.test.js files
        SOME_GLOBAL_VARIABLE: 'test'
    },
    file: 'math.test.js' // test specific file
};

```


## API

`expect(value: any) => Expectation;`

Expectation methods:

-   `toBe(value: any)`  
    Checks like a '==' (idential object, but not strict with types, NaN != NaN)

-   `toBeStrict(value: any)`  
    Strictly checks (like a '===' but considers NaN == NaN, using Object.is, but +0 will be considered equal to -0, in Object.is they are not)

-   `toEqual(value: any, precision = 2)`  
    Deeply compares 2 values, if objects - recursively iterating properties. For primitive properties uses toBe() to compare, except for the floating point numbers - for them uses toBeCloseTo with precision given in second argument

-   `toEqualStrict(value: any, precision = 2)`  
    Works like toEqual, except that for primitive properties uses **toBeStrict** to compare

-   `toBeCloseTo(value: number, precision = 2)`  
    Used to compare floating point numbers with precision given in the second agrument

-   `toHaveProperty(keyPath: string, value: any, strict = false)`  
    Checks if object has property given in keyPath (in format of string where properties are divided by dots: "first.pos.x"). If value is specified, than tries to compare that property with value using toEqual or toEqualStrict depending on third argument **strict**, which is false by default

-   `toContain(item: any)`  
    Checks that value contains item, it works for string to check substring and for Array to check if array includes that item

For testing async code:

-   `toResolve(value: any, strict = false)`
    Checks that the value is a promise and that it resolves. If the value is specified, than checks that it resolves in value, comparing using toEqual / toEqualStrict depending on **strict** argument

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
