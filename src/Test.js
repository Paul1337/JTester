const globalTests = {};
let finishCallback = null;

const resetTests = () => {
    globalTests.passed = 0;
    globalTests.failed = 0;
    globalTests.all = 0;
};

const test = async (title, input) => {
    console.log(`JTesting started: ${title}`);

    let passed = 0;
    const tests = Array.isArray(input) ? input : [input];
    const promises = [];
    globalTests.all += tests.length;
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        const testInfo = `${title} (${i + 1})`;
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

    console.log(`JTesting finished: ${title}`);
    console.log(`Passed ${passed} of ${tests.length}`);
    const failed = tests.length - passed;
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
    console.log(`${testInfo}: ERROR: ${err.message}`);
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
