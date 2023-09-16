import { after } from 'node:test';
import Logger from './Logger';
import MicroTest from './Test/MicroTest';
import Test from './Test/Test';

const globalTest = new Test('Global');

declare global {
    var JTESTER_GLOBALLY: boolean;
    var expect: typeof globalTest.expect;
    var test: typeof globalTest.test;
    var afterAll: () => void;
    var printResult: typeof Logger.printGlobalResult;
    var globalTest: Test;
    var failedMicrotests: MicroTest[];
    var startTime: number;
    var TEST_TITLE: string;
}

let JTester: Record<string, any> = {};

if (globalThis.JTESTER_GLOBALLY) {
    JTester.expect = globalThis.expect;
    JTester.test = globalThis.test;
    JTester.afterAll = globalThis.afterAll;
    JTester.printResult = globalThis.printResult;
} else {
    globalThis.globalTest = globalTest;
    globalThis.failedMicrotests = [];

    globalTest.on('failedMicro', (microTest) => {
        globalThis.failedMicrotests.push(microTest);
    });

    globalThis.JTESTER_GLOBALLY = true;
    JTester = {
        test: (title: string, input: any) => {
            if (!globalThis.startTime) globalThis.startTime = performance.now();
            globalTest.test(title, input);
        },
        expect: globalTest.expect.bind(globalTest),
        afterAll: (callback: () => void) => {
            globalTest.on('finish', callback);
        },
        printResult: Logger.printGlobalResult,
    };
    globalThis.expect = JTester.expect;
    globalThis.test = JTester.test;
    globalThis.afterAll = JTester.afterAll;
    globalThis.printResult = JTester.printResult;
}

export default JTester;
export const test = globalThis.test;
export const expect = globalThis.expect;
export const afterAll = globalThis.afterAll;
export const printResult = globalThis.printResult;
