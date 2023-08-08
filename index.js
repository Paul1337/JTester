const Expectation = require('./src/Expectation/Expectation.js');
const testModule = require('./src/Test.js');

const expect = (value) => new Expectation(value);

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
