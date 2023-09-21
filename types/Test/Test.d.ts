/// <reference types="node" />
import { EventEmitter } from 'events';
import Expectation from '../Expectation/Expectation';
import MicroTest from './MicroTest';
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
    constructor(title: string, parentTest?: Test);
    expect(value: any): Expectation<any>;
    canAddInnerTest(innerTest: Test): boolean;
    test(title: string, input: any): Promise<any[] | Test | undefined>;
    addToAll(cnt: number): void;
    deepRun(): Promise<any[]>;
    run(): Promise<void>;
    pass(microTest: MicroTest): void;
    fail(microTest: MicroTest): void;
    checkCompletion(): void;
    get OK(): boolean;
    get allDone(): boolean;
    addMicroTest(expectation: Expectation<any>): void;
}
