const colors = require('colors/safe');
const ExpectationResult = require('./Expectation/ExpectationResult.js');
const { expect } = require('./Expectation/Expectation.js');
const { isTestProp } = require('./utils.js');

colors.enable();

const globalTests = {};
let finishCallback = null;

const resetTests = () => {
    globalTests.passed = 0;
    globalTests.failed = 0;
    globalTests.all = 0;
};

const buildHookedExpectation = (value) => {
    const expectation = expect(value);
    const newExpectation = {};
    const props = Object.keys(expectation).concat(
        Object.getOwnPropertyNames(Object.getPrototypeOf(expectation)).filter(
            (prop) => prop !== 'constructor'
        )
    );
    for (let prop of props) {
        if (isTestProp(expectation, prop)) {
            newExpectation[prop] = function (...args) {
                const res = expectation[prop].call(expectation, ...args);
                if (this.onTestCall) this.onTestCall(res);
                return res;
            };
        }
    }
    return newExpectation;
};

const testsMap = new Map();

const getAbsoluteBlockTitle = (upperBlocks, blockTitle) =>
    upperBlocks.concat(blockTitle || []).join(' > ');

const registerNewTest = (testAbsoluteTitle, upperBlocks = []) => {
    let parent = null;
    if (upperBlocks.length > 0) {
        const title = getAbsoluteBlockTitle(upperBlocks);
        parent = testsMap.get(title) || null;
    }
    const newTest = {
        title: testAbsoluteTitle,
        finishedElements: 0,
        elements: [],
        parent,
        passed: 0,
        allInnerTests: 0,
    };
    testsMap.set(testAbsoluteTitle, newTest);
    if (parent) {
        parent.elements.push(newTest);
    }
};

const finishTest = (test, passed, blockTests) => {
    if (!test) return;
    test.passed += passed;
    test.allInnerTests += blockTests;
    if (test.parent) {
        test.parent.finishedElements++;
        if (test.parent.finishedElements === test.parent.elements.length) {
            finishTest(test.parent, passed, blockTests);
        }
    } else {
        const resultTxt = `${test.title} result: ${test.passed} of ${test.allInnerTests}`;
        console.log(test.passed < test.allInnerTests ? colors.yellow(resultTxt) : resultTxt);
    }
};

const test = async (blockTitle, input, upperBlocks = []) => {
    if (finishCallback) {
        const msg = `Could not run test "${blockTitle}" because finishCallback is already set. You can only use afterAll(callback) after the tests.`;
        throw new Error(msg);
    }

    const testAbsoluteTitle = getAbsoluteBlockTitle(upperBlocks, blockTitle);
    if (testsMap.has(testAbsoluteTitle)) {
        const msg = `Attempt to run test with duplicate name "${testAbsoluteTitle}"`;
        throw new Error(msg);
    }

    if (globalThis.BLOCK_TITLE && globalThis.BLOCK_TITLE !== blockTitle) return;

    registerNewTest(testAbsoluteTitle, upperBlocks);
    if (upperBlocks.length === 0) console.log(`JTesting started: ${blockTitle}`);
    let passed = 0;
    let tests = [];

    if (typeof input === 'function') {
        const fnContent = input.toString().trim();
        const matches = fnContent.match(/^\s*(function\s+\w*\s*\([^)]*\)\s*{)|(\([^)]*\)\s*=>\s*{)/);
        const firstMatch = matches[0];
        const ind = firstMatch.length;
        const code = fnContent.substring(ind, fnContent.length - 1);
        const expect = (value) => {
            const expectObject = buildHookedExpectation(value);
            expectObject.onTestCall = (expResult) => tests.push(expResult);
            return expectObject;
        };
        const test = (_blockTitle, _input) => {
            globalThis.test(_blockTitle, _input, (upperBlocks ?? []).concat(blockTitle));
        };
        eval(code);
    } else {
        tests = input instanceof ExpectationResult || input instanceof Promise ? [input] : input;
    }

    const promises = [];
    const blockTests = tests.length ?? Object.keys(tests).length;
    globalTests.all += blockTests;

    if (blockTests === 0) return;

    for (let testKey in tests) {
        let test = tests[testKey];
        let testName = isNaN(testKey) ? testKey : Number(testKey) + 1;
        if (test.description) testName = test.description;
        if (Array.isArray(test)) {
            if (test.length > 1) {
                testName = tests[testKey][0];
                test = tests[testKey][1];
            } else {
                test = tests[testKey][0];
            }
        }
        const testInfo = `${testAbsoluteTitle} (${testName})`;
        if (test instanceof Promise) {
            promises.push(
                test
                    .then((expectationResult) => {
                        passed += expectationResult.state === true ? 1 : 0;
                        onTestRan(expectationResult, testInfo);
                    })
                    .catch((err) => {
                        onTestError(err, testInfo);
                    })
            );
        } else {
            passed += test.state === true ? 1 : 0;
            onTestRan(test, testInfo);
        }
    }

    await Promise.all(promises);
    finishTest(testsMap.get(testAbsoluteTitle), passed, blockTests);
    // if (upperBlocks.length === 0) {
    //     const resultTxt = `${blockTitle} result: ${passed} of ${blockTests}`;
    //     console.log(passed < blockTests ? colors.yellow(resultTxt) : resultTxt);
    // }
};

const printResult = () => {
    if (globalTests.failed + globalTests.passed === globalTests.all) {
        console.log(`Global JTesting finished!`);
    } else {
        const ran = globalTests.failed + globalTests.passed;
        console.log(`Global JTesting intermediate result (Ran ${ran} tests):`);
    }
    const percent = ((globalTests.passed / globalTests.all) * 100).toFixed(2);
    const OK = globalTests.failed === 0;
    const cl = OK ? 'green' : 'red';
    console.log(colors[cl](`Passed ${globalTests.passed} of ${globalTests.all} (${percent}%)`));
    if (OK) console.log(colors[cl].underline('All Ok'));
    else console.log(colors[cl].underline(`Failed: ${globalTests.failed} tests`));
};

const afterAll = (callback, delay = 0) => {
    finishCallback = callback;
    if (globalTests.all === 0) return;
    const allDone = globalTests.failed + globalTests.passed === globalTests.all;
    if (allDone && typeof finishCallback === 'function') setTimeout(finishCallback, delay);
};

const onTestError = (err, testInfo = 'Test') => {
    globalTests.failed++;
    console.log(colors.red(`${testInfo}: ERROR ${err.message ? err.message : err}`));
    const allDone = globalTests.failed + globalTests.passed === globalTests.all;
    if (allDone && typeof finishCallback === 'function') finishCallback();
};

const onTestRan = (expectationResult, testInfo = 'Test') => {
    const resultMsg = `${testInfo}: ${expectationResult.resultTxt}`;
    if (expectationResult.state === true) {
        globalTests.passed++;
        console.log(colors.green(resultMsg));
    } else {
        globalTests.failed++;
        console.log(colors.red(resultMsg));
    }
    const allDone = globalTests.failed + globalTests.passed === globalTests.all;
    if (allDone && typeof finishCallback === 'function') finishCallback();
};

// Default case
resetTests();

globalThis.test = test;

module.exports = {
    test,
    afterAll,
    printResult,
    resetTests,
};
