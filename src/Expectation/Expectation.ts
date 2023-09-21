import ExpectationResult from './ExpectationResult';

function isFloat(value: any) {
    if (typeof value === 'number' && !Number.isNaN(value) && !Number.isInteger(value)) return true;
    return false;
}

export default class Expectation<T> {
    isInversed: boolean;
    results: ExpectationResult[];
    resultInd: number;
    value: T;
    description: string | null = null;

    constructor(value: T) {
        this.value = value;
        this.isInversed = false;

        this.results = [];
        this.resultInd = -1;
    }

    described(description: string) {
        if (this.result) this.result.description = description;
        this.description = description;
        return this;
    }

    async solve() {
        this.resultInd = -1;
        for (let result of this.results) {
            this.resultInd++;
            let ok = true;
            await result.solve().then(() => {
                ok = result.state as boolean;
            });
            if (!ok) break;
        }
        if (this.description) this.result.described(this.description);
    }

    chain(callback: (value: T) => T) {
        // this.chains.push(callback);
        this.value = callback(this.value);
        return this;
    }

    get result() {
        return this.results[this.resultInd];
    }

    get not() {
        const newExpectation = new Expectation(this.value);
        newExpectation.isInversed = true;
        return newExpectation;
    }

    handleResult(result: ExpectationResult) {
        const totalResult = this.isInversed ? result.inversed() : result;
        this.results.push(totalResult);
        this.value = totalResult.expected;
        return this;
    }

    toContain(item: any) {
        return this.handleResult(
            new ExpectationResult(this._toContain(item), this.value, 'to contain', item)
        );
    }

    _toContain(item: any) {
        if ((typeof this.value === 'string' && typeof item === 'string') || Array.isArray(this.value))
            return this.value.includes(item);
        return false;
    }

    toBe(value: any) {
        return this.handleResult(new ExpectationResult(this._toBe(value), this.value, 'to be', value));
    }

    _toBe(value: any) {
        return this.value == value;
    }

    toBeStrict(value: any) {
        return this.handleResult(
            new ExpectationResult(this._toBeStrict(value), this.value, 'to be strict', value)
        );
    }

    _toBeStrict(value: any) {
        if (this.value === 0 && value === 0) return true;
        return Object.is(this.value, value);
    }

    toEqual(value: any, precision?: number) {
        return this.handleResult(
            new ExpectationResult(this._toEqual(value, precision), this.value, 'to equal', value)
        );
    }

    _toEqual(value: any, precision?: number) {
        return this._toEqualGeneric(value, this._toBe, precision);
    }

    toEqualStrict(value: any, precision?: number) {
        const action = 'to equal strict';
        return this.handleResult(
            new ExpectationResult(this._toEqualStrict(value, precision), this.value, action, value)
        );
    }

    _toEqualStrict(value: any, precision?: number) {
        return this._toEqualGeneric(value, this._toBeStrict, precision);
    }

    toBeCloseTo(value: any, numDigits = 2) {
        const action = 'to be close to';
        return this.handleResult(
            new ExpectationResult(this._toBeCloseTo(value, numDigits), this.value, action, value)
        );
    }

    _toBeCloseTo(value: any, numDigits = 2) {
        if (typeof this.value !== 'number' || typeof value !== 'number')
            throw new TypeError('value must be a number');
        return Math.abs(value - this.value) < Math.pow(10, -numDigits) / 2;
    }

    toBeDefined() {
        return this.handleResult(
            new ExpectationResult(this._toBeDefined(), this.value, 'to be defined')
        );
    }

    _toBeDefined() {
        return this.value !== undefined;
    }

    toBeUndefined() {
        return this.handleResult(
            new ExpectationResult(this._toBeUndefined(), this.value, 'to be undefined')
        );
    }

    _toBeUndefined() {
        return this.value === undefined;
    }

    toBeNull() {
        return this.handleResult(new ExpectationResult(this._toBeNull(), this.value, 'to be null'));
    }

    _toBeNull() {
        return this.value === null;
    }

    toBeTruthy() {
        return this.handleResult(new ExpectationResult(this._toBeTruthy(), this.value, 'to be truthy'));
    }

    _toBeTruthy() {
        return Boolean(this.value);
    }

    toBeNaN() {
        return this.handleResult(new ExpectationResult(this._toBeNaN(), this.value, 'to be NaN'));
    }

    _toBeNaN() {
        return isNaN(Number(this.value));
    }

    toBePromise() {
        return this.handleResult(
            new ExpectationResult(this._toBePromise(), this.value, 'to be a Promise')
        );
    }

    _toBePromise() {
        return this.value instanceof Promise;
    }

    toBeArray() {
        return this.handleResult(new ExpectationResult(this._toBeArray(), this.value, 'to be an Array'));
    }

    _toBeArray() {
        return Array.isArray(this.value);
    }

    toHaveProperty(keyPath: string, value: any, strict = false) {
        return this.handleResult(
            new ExpectationResult(
                this._toHaveProperty(keyPath, value, strict),
                this.value,
                `to have property ${keyPath} ${
                    value ? 'and equal ' + (strict ? 'strict' : '"') + value + '"' : ''
                }`
            )
        );
    }

    _toHaveProperty(keyPath: string, value: any, strict = false) {
        const props = keyPath.split('.');
        let cur: any = this.value;
        for (let prop of props) {
            cur = cur?.[prop];
            if (cur === undefined) return false;
        }
        if (!value) return true;
        if (!strict) return new Expectation(cur)._toEqual(value);
        else return new Expectation(cur)._toEqualStrict(value);
    }

    _toEqualGeneric(value: any, cmpFn: (value: any) => boolean, precision = 2) {
        if (this.value == undefined || value == undefined) {
            return cmpFn.call(this, value);
        }
        if (typeof this.value === 'object' && typeof value === 'object') {
            for (let property in this.value) {
                const propVal = this.value[property];
                const compVal = value[property];

                const expectObj = new Expectation(propVal);
                if (!expectObj._toEqualGeneric(compVal, cmpFn, precision)) {
                    return false;
                }
            }
            return true;
        } else {
            if (isFloat(this.value) && isFloat(value)) {
                return this._toBeCloseTo(value, precision);
            }
            return cmpFn.call(this, value);
        }
    }

    toResolve(value: any, strict = false) {
        if (!this._toBePromise()) return this.toBePromise();

        const expectationResult = new ExpectationResult(
            (this.value as Promise<any>).then(
                (resolveValue: any) => {
                    if (!value) return true;
                    const expectation = new Expectation(resolveValue);
                    return strict
                        ? expectation.toEqualStrict(value).result
                        : expectation.toEqual(value).result;
                },
                (rejectValue: any) => false
            ),
            this.value,
            'to resolve'
        );

        return this.handleResult(expectationResult);
    }

    toReject(value: any, strict = false) {
        if (!this._toBePromise()) return this.toBePromise();

        return this.handleResult(
            new ExpectationResult(
                (this.value as Promise<any>).then(
                    (resolveValue: any) => false,
                    (rejectValue: any) => {
                        if (!value) return true;
                        const expectation = new Expectation(rejectValue);
                        return strict
                            ? expectation.toEqualStrict(value).result
                            : expectation.toEqual(value).result;
                    }
                ),
                this.value,
                'to reject'
            )
        );
    }
}
