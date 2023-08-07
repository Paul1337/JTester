const colors = require('colors/safe');
const ExpectationResult = require('./Expectation/ExpectationResult.js');

colors.enable();

const globalTests = {};
let finishCallback = null;

const resetTests = () => {
    globalTests.passed = 0;
    globalTests.failed = 0;
    globalTests.all = 0;
};

const test = async (blockTitle, input) => {
    if (globalThis.BLOCK_TITLE && globalThis.BLOCK_TITLE !== blockTitle) return;
    console.log(`JTesting started: ${blockTitle}`);
    let passed = 0;
    const tests = input instanceof ExpectationResult || input instanceof Promise ? [input] : input;
    const promises = [];
    const blockTests = tests.length ?? Object.keys(tests).length;
    globalTests.all += blockTests;
    for (let testKey in tests) {
        let test = tests[testKey];
        let testName = isNaN(testKey) ? testKey : Number(testKey) + 1;
        if (Array.isArray(test)) {
            if (test.length > 1) {
                testName = tests[testKey][0];
                test = tests[testKey][1];
            } else {
                test = tests[testKey][0];
            }
        }
        const testInfo = `${blockTitle} (${testName})`;
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

    const resultTxt = `${blockTitle} result: ${passed} of ${blockTests}`;
    console.log(passed < blockTests ? colors.yellow(resultTxt) : resultTxt);
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
        console.error(colors.red(resultMsg));
    }
    const allDone = globalTests.failed + globalTests.passed === globalTests.all;
    if (allDone && typeof finishCallback === 'function') finishCallback();
};

// Default case
resetTests();

module.exports = {
    test,
    afterAll,
    printResult,
    resetTests,
};
