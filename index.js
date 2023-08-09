const { expect } = require('./src/Expectation/Expectation.js');
const testModule = require('./src/Test.js');

if (globalThis.JTESTER_GLOBALLY) {
    exports.expect = globalThis.expect;
    exports.test = globalThis.test;
    exports.afterAll = globalThis.afterAll;
    exports.printResult = globalThis.printResult;
    exports.resetTests = globalThis.resetTests;
} else {
    exports.expect = expect;
    exports.test = testModule.test;
    exports.afterAll = testModule.afterAll;
    exports.printResult = testModule.printResult;
    exports.resetTests = testModule.resetTests;
}
