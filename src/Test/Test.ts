import { EventEmitter } from 'events';
import Expectation from '../Expectation/Expectation';
import { testStore } from './TestStore';
import MicroTest from './MicroTest';
import Logger from '../Logger';

const Events = {
    Finished: 'finish',
    FailedMicroTest: 'failedMicro',
    PassedMicroTest: 'passedMicro',
};

export interface ITestEnv {
    test: Test['test'];
    expect: Test['expect'];
}

export default class Test extends EventEmitter {
    title: string;
    innerTests: Test[];
    parentTest: Test | undefined;
    absoluteTitle: string;
    microTests: MicroTest[];

    passed: number;
    failed: number;
    all: number;

    isFinished: boolean;
    innerTestsStartedToRegister: number;
    innerTestsRegistered: number;

    constructor(title: string, parentTest?: Test) {
        super();

        this.title = title;
        this.innerTests = [];
        this.parentTest = parentTest;

        if (parentTest) {
            this.absoluteTitle =
                parentTest === globalThis.globalTest ? title : `${parentTest.absoluteTitle} > ${title}`;
        } else {
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

    expect(value: any) {
        const expectation = new Expectation(value);
        this.addMicroTest(expectation);
        return expectation;
    }

    canAddInnerTest(innerTest: Test) {
        if (globalThis.TEST_TITLE && !globalThis.TEST_TITLE.startsWith(innerTest.absoluteTitle))
            return false;
        return true;
    }

    async test(title: string, input: any) {
        this.innerTestsStartedToRegister++;

        const innerTest = new Test(title, this);
        if (!this.canAddInnerTest(innerTest)) return;
        if (testStore.testsExist(innerTest.absoluteTitle)) {
            return innerTest.deepRun();
        }

        testStore.addTest(innerTest);
        this.innerTests.push(innerTest);

        if (typeof input === 'function') {
            const env: ITestEnv = {
                test: innerTest.test.bind(innerTest),
                expect: innerTest.expect.bind(innerTest),
            };
            const fnRes = input.call(innerTest, env);
            if (fnRes instanceof Promise) {
                await fnRes;
            }
        } else if (typeof input === 'object') {
            if (input instanceof Expectation) {
                innerTest.microTests.push(
                    new MicroTest(input, { index: 1, absoluteTitle: innerTest.absoluteTitle })
                );
            } else {
                let index = 0;
                for (let microTestKey in input) {
                    let microTest = input[microTestKey];
                    if (!microTest) continue;

                    let microTestDescription =
                        !Array.isArray(input) && microTestKey ? microTestKey : undefined;
                    if (Array.isArray(microTest)) {
                        if (microTest.length > 1) {
                            microTestDescription = microTest[0];
                            microTest = microTest[1];
                        } else {
                            microTest = microTest[0];
                        }
                    }
                    const metaData = {
                        description: microTestDescription,
                        index: ++index,
                        absoluteTitle: innerTest.absoluteTitle,
                    };

                    innerTest.microTests.push(new MicroTest(microTest, metaData));
                }
            }
        } else {
            throw new Error('Unsupported format of second argument in test()');
        }

        innerTest.addToAll(innerTest.microTests.length);

        this.innerTestsRegistered++;
        await innerTest.run();
        return innerTest;
    }

    addToAll(cnt: number) {
        this.all += cnt;
        if (this.parentTest) {
            this.parentTest.addToAll(cnt);
        }
    }

    async deepRun() {
        const promises: Promise<any>[] = [this.run()];
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
                    } else {
                        this.fail(microTest);
                    }
                    Logger.printMicroTestResult(microTest);
                })
                .catch((err: Error) => {
                    Logger.printMicroTestError(microTest, err);
                    this.fail(microTest);
                })
                .then(this.checkCompletion.bind(this));
        });
        await Promise.all(promises);
    }

    pass(microTest: MicroTest) {
        this.passed++;
        this.emit(Events.PassedMicroTest, microTest);
        if (this.parentTest) {
            this.parentTest.pass(microTest);
        }
    }

    fail(microTest: MicroTest) {
        this.failed++;
        this.emit(Events.FailedMicroTest, microTest);
        if (this.parentTest) {
            this.parentTest.fail(microTest);
        }
    }

    checkCompletion() {
        if (this.isFinished) return;
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
        if (this.innerTestsStartedToRegister > this.innerTestsRegistered) return false;
        return this.failed + this.passed === this.all;
    }

    addMicroTest(expectation: Expectation<any>) {
        const microTest = new MicroTest(expectation, {
            index: this.microTests.length + 1,
            absoluteTitle: this.absoluteTitle,
        });
        this.microTests.push(microTest);
    }
}
