const colors = require('colors/safe');
// colors.enable();

class Logger {
    static printGlobalResult() {
        if (globalTest.failed + globalTest.passed === globalTest.all) {
            console.log(`Global JTesting finished!`);
        } else {
            throw new Error('Attempt to printGlobalResult when not all tests are finished');
        }
        const percent = ((globalTest.passed / globalTest.all) * 100).toFixed(2);
        const OK = globalTest.failed === 0;
        const cl = OK ? 'green' : 'red';
        console.log(colors[cl].bold(`Passed ${globalTest.passed} of ${globalTest.all} (${percent}%)`));
        if (OK) console.log(colors[cl].underline.bold('All Ok'));
        // else console.log(colors[cl].underline(`Failed: ${globalTest.failed} tests`));
        else Logger.printFailedMicrotests();
    }

    static printTestResult(test) {
        const resultTxt = `${test.title} result: ${test.passed} of ${test.all}`;
        console.log(test.passed < test.all ? colors.yellow(resultTxt) : resultTxt);
    }

    static printTestStart(test) {
        console.log(`JTesting started: ${test.absoluteTitle}`);
    }

    static printMicroTestResult(microTest) {
        const itemInfo =
            microTest.value.description ??
            microTest.meta.description ??
            microTest.meta.index ??
            'no-descr';
        const resultMsg = `${microTest.meta.absoluteTitle} (${itemInfo}): ${colors.bold(
            microTest.value.resultTxt
        )}`;
        const messageFormatted =
            microTest.value.state === true ? colors.green(resultMsg) : colors.red(resultMsg);
        console.log(messageFormatted);
    }

    static printFailedMicrotests() {
        if (failedMicrotests.length === 0) return;
        console.log('Failed ones:');
        for (let microtest of failedMicrotests) {
            Logger.printMicroTestResult(microtest);
        }
    }

    static printMicroTestError(microtest, error) {
        console.log(colors.red(`${microtest.meta.absoluteTitle}: Error - ${error.message ?? error}`));
    }
}

module.exports = Logger;
