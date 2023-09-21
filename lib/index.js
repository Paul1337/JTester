"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printResult = exports.afterAll = exports.expect = exports.test = void 0;
const Logger_1 = __importDefault(require("./Logger"));
const Test_1 = __importDefault(require("./Test/Test"));
const globalTest = new Test_1.default('Global');
let JTester = {};
if (globalThis.JTESTER_GLOBALLY) {
    JTester.expect = globalThis.expect;
    JTester.test = globalThis.test;
    JTester.afterAll = globalThis.afterAll;
    JTester.printResult = globalThis.printResult;
}
else {
    globalThis.globalTest = globalTest;
    globalThis.failedMicrotests = [];
    globalTest.on('failedMicro', (microTest) => {
        globalThis.failedMicrotests.push(microTest);
    });
    globalThis.JTESTER_GLOBALLY = true;
    JTester = {
        test: (title, input) => {
            if (!globalThis.startTime)
                globalThis.startTime = performance.now();
            globalTest.test(title, input);
        },
        expect: globalTest.expect.bind(globalTest),
        afterAll: (callback) => {
            globalTest.on('finish', callback);
        },
        printResult: Logger_1.default.printGlobalResult,
    };
    globalThis.expect = JTester.expect;
    globalThis.test = JTester.test;
    globalThis.afterAll = JTester.afterAll;
    globalThis.printResult = JTester.printResult;
}
exports.default = JTester;
exports.test = globalThis.test;
exports.expect = globalThis.expect;
exports.afterAll = globalThis.afterAll;
exports.printResult = globalThis.printResult;
__exportStar(require("./Test/Test"), exports);
