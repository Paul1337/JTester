"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const Expectation_1 = __importDefault(require("../Expectation/Expectation"));
const TestStore_1 = require("./TestStore");
const MicroTest_1 = __importDefault(require("./MicroTest"));
const Logger_1 = __importDefault(require("../Logger"));
const Events = {
    Finished: 'finish',
    FailedMicroTest: 'failedMicro',
    PassedMicroTest: 'passedMicro',
};
class Test extends events_1.EventEmitter {
    constructor(title, parentTest) {
        super();
        this.title = title;
        this.innerTests = [];
        this.parentTest = parentTest;
        if (parentTest) {
            this.absoluteTitle =
                parentTest === globalThis.globalTest ? title : `${parentTest.absoluteTitle} > ${title}`;
        }
        else {
            this.absoluteTitle = title;
        }
        this.microTests = []; // Array<Microtest>
        this.passed = 0;
        this.failed = 0;
        this.all = 0;
        this.isFinished = false;
        this.innerTestsStartedToRegister = 0;
        this.innerTestsRegistered = 0;
    }
    expect(value) {
        const expectation = new Expectation_1.default(value);
        this.addMicroTest(expectation);
        return expectation;
    }
    canAddInnerTest(innerTest) {
        if (globalThis.TEST_TITLE && !globalThis.TEST_TITLE.startsWith(innerTest.absoluteTitle))
            return false;
        return true;
    }
    async test(title, input) {
        this.innerTestsStartedToRegister++;
        const innerTest = new Test(title, this);
        if (!this.canAddInnerTest(innerTest))
            return;
        if (TestStore_1.testStore.testsExist(innerTest.absoluteTitle)) {
            return innerTest.deepRun();
        }
        TestStore_1.testStore.addTest(innerTest);
        this.innerTests.push(innerTest);
        if (typeof input === 'function') {
            const fnRes = input.call(innerTest, {
                test: innerTest.test.bind(innerTest),
                expect: innerTest.expect.bind(innerTest),
            });
            if (fnRes instanceof Promise) {
                await fnRes;
            }
        }
        else if (typeof input === 'object') {
            if (input instanceof Expectation_1.default) {
                innerTest.microTests.push(new MicroTest_1.default(input, { index: 1, absoluteTitle: innerTest.absoluteTitle }));
            }
            else {
                let index = 0;
                for (let microTestKey in input) {
                    let microTest = input[microTestKey];
                    if (!microTest)
                        continue;
                    let microTestDescription = !Array.isArray(input) && microTestKey ? microTestKey : undefined;
                    if (Array.isArray(microTest)) {
                        if (microTest.length > 1) {
                            microTestDescription = microTest[0];
                            microTest = microTest[1];
                        }
                        else {
                            microTest = microTest[0];
                        }
                    }
                    const metaData = {
                        description: microTestDescription,
                        index: ++index,
                        absoluteTitle: innerTest.absoluteTitle,
                    };
                    innerTest.microTests.push(new MicroTest_1.default(microTest, metaData));
                }
            }
        }
        else {
            throw new Error('Unsupported format of second argument in test()');
        }
        innerTest.addToAll(innerTest.microTests.length);
        this.innerTestsRegistered++;
        await innerTest.run();
        return innerTest;
    }
    addToAll(cnt) {
        this.all += cnt;
        if (this.parentTest) {
            this.parentTest.addToAll(cnt);
        }
    }
    async deepRun() {
        const promises = [this.run()];
        for (let test of this.innerTests) {
            promises.push(test.deepRun());
        }
        return Promise.all(promises);
    }
    async run() {
        // Logger.printTestStart(this);
        const promises = this.microTests.map((microTest) => {
            const expectation = microTest.value;
            return expectation
                .solve()
                .then(() => {
                if (expectation.result.state === true) {
                    this.pass(microTest);
                }
                else {
                    this.fail(microTest);
                }
                Logger_1.default.printMicroTestResult(microTest);
            })
                .catch((err) => {
                Logger_1.default.printMicroTestError(microTest, err);
                this.fail(microTest);
            })
                .then(this.checkCompletion.bind(this));
        });
        await Promise.all(promises);
    }
    pass(microTest) {
        this.passed++;
        this.emit(Events.PassedMicroTest, microTest);
        if (this.parentTest) {
            this.parentTest.pass(microTest);
        }
    }
    fail(microTest) {
        this.failed++;
        this.emit(Events.FailedMicroTest, microTest);
        if (this.parentTest) {
            this.parentTest.fail(microTest);
        }
    }
    checkCompletion() {
        if (this.isFinished)
            return;
        if (this.allDone) {
            this.isFinished = true;
            this.emit(Events.Finished);
            if (this.parentTest) {
                this.parentTest.checkCompletion();
            }
        }
    }
    get OK() {
        return this.passed === this.all;
    }
    get allDone() {
        if (this.innerTestsStartedToRegister > this.innerTestsRegistered)
            return false;
        return this.failed + this.passed === this.all;
    }
    addMicroTest(expectation) {
        const microTest = new MicroTest_1.default(expectation, {
            index: this.microTests.length + 1,
            absoluteTitle: this.absoluteTitle,
        });
        this.microTests.push(microTest);
    }
}
exports.default = Test;
