import ExpectationResult from './ExpectationResult';
export default class Expectation<T> {
    isInversed: boolean;
    results: ExpectationResult[];
    resultInd: number;
    value: T;
    description: string | null;
    constructor(value: T);
    described(description: string): this;
    solve(): Promise<void>;
    chain(callback: (value: T) => T): this;
    get result(): ExpectationResult;
    get not(): Expectation<T>;
    handleResult(result: ExpectationResult): this;
    toContain(item: any): this;
    _toContain(item: any): boolean;
    toBe(value: any): this;
    _toBe(value: any): boolean;
    toBeStrict(value: any): this;
    _toBeStrict(value: any): boolean;
    toEqual(value: any, precision?: number): this;
    _toEqual(value: any, precision?: number): boolean;
    toEqualStrict(value: any, precision?: number): this;
    _toEqualStrict(value: any, precision?: number): boolean;
    toBeCloseTo(value: any, numDigits?: number): this;
    _toBeCloseTo(value: any, numDigits?: number): boolean;
    toBeDefined(): this;
    _toBeDefined(): boolean;
    toBeUndefined(): this;
    _toBeUndefined(): boolean;
    toBeNull(): this;
    _toBeNull(): boolean;
    toBeTruthy(): this;
    _toBeTruthy(): boolean;
    toBeNaN(): this;
    _toBeNaN(): boolean;
    toBePromise(): this;
    _toBePromise(): boolean;
    toBeArray(): this;
    _toBeArray(): boolean;
    toHaveProperty(keyPath: string, value: any, strict?: boolean): this;
    _toHaveProperty(keyPath: string, value: any, strict?: boolean): boolean;
    _toEqualGeneric(value: any, cmpFn: (value: any) => boolean, precision?: number): boolean;
    toResolve(value: any, strict?: boolean): this;
    toReject(value: any, strict?: boolean): this;
}
