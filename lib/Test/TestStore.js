"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testStore = void 0;
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
exports.testStore = new TestStore();
