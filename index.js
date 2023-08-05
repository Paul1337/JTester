const Expectation = require('./src/Expectation/Expectation.js');
const testModule = require('./src/Test.js');

const expect = (value) => new Expectation(value);

exports.expect = expect;
exports.test = testModule.test;
exports.afterAll = testModule.afterAll;
exports.printResult = testModule.printResult;
exports.resetTests = testModule.resetTests;
