import MicroTest from './Test/MicroTest';
import Test from './Test/Test';
export default class Logger {
    static printGlobalResult(): void;
    static printTestResult(test: Test): void;
    static printTestStart(test: Test): void;
    static printMicroTestResult(microTest: MicroTest): void;
    static printFailedMicrotests(): void;
    static printMicroTestError(microtest: MicroTest, error: Error): void;
}
