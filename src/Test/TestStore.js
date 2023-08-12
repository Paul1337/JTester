class TestStore {
    constructor() {
        this.tests = new Map();
    }

    testsExist(absoluteTitle) {
        return Boolean(this.tests.get(absoluteTitle));
    }

    addTest(test) {
        this.tests.set(test.absoluteTitle, test);
    }
}

module.exports.testStore = new TestStore();
