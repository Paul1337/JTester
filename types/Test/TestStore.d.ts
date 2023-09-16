import Test from './Test';
declare class TestStore {
    tests: Map<string, Test>;
    constructor();
    testsExist(absoluteTitle: string): boolean;
    addTest(test: Test): void;
}
export declare const testStore: TestStore;
export {};
