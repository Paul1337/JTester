const ExpectationResult = require('./Expectation/ExpectationResult.js');

const globalTests = {};
let finishCallback = null;

const resetTests = () => {
    globalTests.passed = 0;
    globalTests.failed = 0;
    globalTests.all = 0;
};

const test = async (blockTitle, input) => {
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

    console.log(`JTesting finished: ${blockTitle}`);
    console.log(`Passed ${passed} of ${blockTests}`);
    const failed = blockTests - passed;
    if (failed === 0) console.log('OK');
    else console.log(`Failed: ${failed} tests`);
};

const printResult = () => {
    if (globalTests.failed + globalTests.passed === globalTests.all) {
        console.log(`Global JTesting finished!`);
    } else {
        const ran = globalTests.failed + globalTests.passed;
        console.log(`Global JTesting intermediate result (Ran ${ran} tests):`);
    }
    const percent = ((globalTests.passed / globalTests.all) * 100).toFixed(2);
    console.log(`Passed ${globalTests.passed} of ${globalTests.all} (${percent}%)`);
    if (globalTests.failed === 0) console.log('OK');
    else console.log(`Failed: ${globalTests.failed} tests`);
};

const afterAll = (callback, delay = 0) => {
    finishCallback = callback;
    if (globalTests.all === 0) return;
    const allDone = globalTests.failed + globalTests.passed === globalTests.all;
    if (allDone && typeof finishCallback === 'function') setTimeout(finishCallback, delay);
};

const onTestError = (err, testInfo = 'Test') => {
    globalTests.failed++;
    console.log(`${testInfo}: ERROR ${err.message ? err.message : err}`);
    const allDone = globalTests.failed + globalTests.passed === globalTests.all;
    if (allDone && typeof finishCallback === 'function') finishCallback();
};

const onTestRan = (expectationResult, testInfo = 'Test') => {
    const resultMsg = `${testInfo}: ${expectationResult.resultTxt}`;
    if (expectationResult.state === true) {
        globalTests.passed++;
        console.log(resultMsg);
    } else {
        globalTests.failed++;
        console.error(resultMsg);
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
