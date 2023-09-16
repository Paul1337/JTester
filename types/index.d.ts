import Logger from './Logger';
import MicroTest from './Test/MicroTest';
import Test from './Test/Test';
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
declare let JTester: Record<string, any>;
export default JTester;
export declare const test: (title: string, input: any) => Promise<any[] | Test | undefined>;
export declare const expect: (value: any) => import("./Expectation/Expectation").default<any>;
export declare const afterAll: () => void;
export declare const printResult: typeof Logger.printGlobalResult;
