import Test from './Test';

class TestStore {
    tests: Map<string, Test>;

    constructor() {
        this.tests = new Map();
    }

    testsExist(absoluteTitle: string) {
        return Boolean(this.tests.get(absoluteTitle));
    }

    addTest(test: Test) {
        this.tests.set(test.absoluteTitle, test);
    }
}

export const testStore = new TestStore();
