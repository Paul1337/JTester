const Test = require('./Test/Test.js');
const Logger = require('./Logger.js');

const globalTest = new Test('Global');

if (globalThis.JTESTER_GLOBALLY) {
    const methods = ['expect', 'test', 'afterAll', 'printResult'];
    for (let method of methods) module.exports[method] = globalThis[method];
} else {
    globalThis.globalTest = globalTest;
    globalThis.failedMicrotests = [];

    globalTest.on('failedMicro', (microTest) => {
        globalThis.failedMicrotests.push(microTest);
    });

    module.exports = {
        test: (...args) => {
            if (!globalThis.startTime) globalThis.startTime = performance.now();
            globalTest.test(...args);
        },
        expect: globalTest.expect.bind(globalTest),
        afterAll: (callback) => {
            globalTest.on('finish', callback);
        },
        printResult: Logger.printGlobalResult,
    };
}
