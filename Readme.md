# A simple node.js library for creating unit tests.

## About  

Briefly about features: 
- *Run time testing support*
- *JS & TS support*
- *Allows to build hierarhy of tests you want*
- *Simple to use*
- *Configurable*

This library is aimed to be as simple as possible in terms of unit testing and provide some opportunities and flexibility. Even though it is simple we want it to be able to handle testing for apps of any kind and scale.  
There are 2 ways of using package: run-time testing in node.js environment & in-development testing using as CLI tool.  

Random example to take a brief look:
```js

test('Parser', (env) => {
    env.test('tokenization', (env) => {
        env.expect(someParser.tokenize('this is jtester'))
            .toEqual(['this', 'is', 'jtester'])
            .described('Splitting words');
        env.expect(someParser.tokenize('jtester, ok'))
            .toEqual(['jtester', 'ok'])
            .described('Splitting by comma');
    });

    test('parsing tokens', expect(someParser.parseTokens(someTokens)).toEqual(something));
});

```
Our tests are created with **test()** functions, which may be used for a block of test or just for one test.
In these functions you can use **expect** to describe microtests.
You can build hierarchy of those tests as you like to make it semantically correct for your case and to provide functional scope for each of them.
Or you can stay with more simplified syntax, passing an array of just expect() to the test function - that may be enough depending on your case.
You can read that in our small documentation below.

## Getting started

Installation:

```bash
npm i -D jtester
```

## Run-time testing (as we call it)

Basic example (one test in a block):

_testFile.js_

```js
const { expect, test } = require('jtester');
test('Math', expect(2 * 2).toBe(4));
```

_Then you can run test file in node.js environment:_

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

Printing global result (of all test blocks) you can use **afterAll(callback, delay=0)** with **printResult** API:  
*Note: afterAll() should be in the end (after all tests are registered with test() function). It will wait for all the async tests to finish.*

```js
import { expect, test, afterAll, printResult } from 'JTester';
test('Math', [
    expect(2 * 2).toBe(4), 
    expect(5 - 3).toBe(2), 
    expect(0.4 + 0.2).toBeCloseTo(0.6)
]);
afterAll(printResult);
```

If you want to describe each microtest in a block, you can do it several ways:

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
// also like this
test('Math', [
    expect(2 * 2).toBe(4), 
    expect(0.4 + 0.2).toBeCloseTo(0.6).described('Adding float numbers'),
]);
```

Actually, you can pass a function as the second argument.  
In that case you need to get **env** object passed to the function and use its *expect* and *test*.
Alternatively, you can use this.expect / this.test, but then you can't use arrow function syntax.

```js
test('Functional block', (env) => {
    const four = 4, five = 5;
    env.expect(four).toBe(4); 
    env.expect(five).toBe(5).described('Some description if needed'); 
});
```

And actually, you can put tests inside tests building semantic tree like this:
```js
test('Functional block', (env) => {
    const four = 4, five = 5;
    env.expect(four).toBe(4); 
    env.test('Another block for 5', (env) => {
        env.expect(five).toBe(5).described('Some description if needed');         
    });
});
```
This way you will be seeing logging in another format, due to the heirarhy of tests and total result will only be displayed for top level blocks, aggregating all inner tests. Not for every block.  

Also, titles of blocks should be unique in the their scope, if you run **test()** on existing test, *JTester* will try to run the same test again (won't consider it as a new one) - this is useful in run-time testing when you want to run test again on some button click or other app event.

When using function as the second argument you can describe tests using **described(text)** method shown above.

Library supports methods to work with async functions like **toResolve**, and **toReject**, but you can also pass _Promise_ which returns **ExpectationResult** or rejects like this:

```js
test(
    'some async',
    asyncFunction().then((res) => expect(res).toBe('some res'))
);
```

You can chain expect results using `chain` method, which may be a handy thing:

```js
test('math', expect(add(2, 2)).toBe(4).chain(v => v + 2).toBe(6));
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

-   CLI tool runs all those test files in one environment providing JTESTER API functions in global context by default, but if you want you can import them explicitly
-   You can use CJS or ESM module system in \*.test.js file, babel is used to handle import / export
-   You are going to see global result of all your test files, so you don't need `afterAll(printResult)` as you needed in run-time testing

## Configuration

Configuration is for cli tool.
There is a default configuration, which is used when you run `jsteter` without params.
You can override it by _jtester.config.js_ which should export default config object (in cjs or esm as you like).
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

Above methods return **ExpectationResult**, with which test() function works natively.
