"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ExpectationResult_1 = __importDefault(require("./ExpectationResult"));
function isFloat(value) {
    if (typeof value === 'number' && !Number.isNaN(value) && !Number.isInteger(value))
        return true;
    return false;
}
class Expectation {
    constructor(value) {
        this.description = null;
        this.value = value;
        this.isInversed = false;
        this.results = [];
        this.resultInd = -1;
    }
    described(description) {
        if (this.result)
            this.result.description = description;
        this.description = description;
        return this;
    }
    async solve() {
        this.resultInd = -1;
        for (let result of this.results) {
            this.resultInd++;
            let ok = true;
            await result.solve().then(() => {
                ok = result.state;
            });
            if (!ok)
                break;
        }
        if (this.description)
            this.result.described(this.description);
    }
    chain(callback) {
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
    handleResult(result) {
        const totalResult = this.isInversed ? result.inversed() : result;
        this.results.push(totalResult);
        this.value = totalResult.expected;
        return this;
    }
    toContain(item) {
        return this.handleResult(new ExpectationResult_1.default(this._toContain(item), this.value, 'to contain', item));
    }
    _toContain(item) {
        if ((typeof this.value === 'string' && typeof item === 'string') || Array.isArray(this.value))
            return this.value.includes(item);
        return false;
    }
    toBe(value) {
        return this.handleResult(new ExpectationResult_1.default(this._toBe(value), this.value, 'to be', value));
    }
    _toBe(value) {
        return this.value == value;
    }
    toBeStrict(value) {
        return this.handleResult(new ExpectationResult_1.default(this._toBeStrict(value), this.value, 'to be strict', value));
    }
    _toBeStrict(value) {
        if (this.value === 0 && value === 0)
            return true;
        return Object.is(this.value, value);
    }
    toEqual(value, precision) {
        return this.handleResult(new ExpectationResult_1.default(this._toEqual(value, precision), this.value, 'to equal', value));
    }
    _toEqual(value, precision) {
        return this._toEqualGeneric(value, this._toBe, precision);
    }
    toEqualStrict(value, precision) {
        const action = 'to equal strict';
        return this.handleResult(new ExpectationResult_1.default(this._toEqualStrict(value, precision), this.value, action, value));
    }
    _toEqualStrict(value, precision) {
        return this._toEqualGeneric(value, this._toBeStrict, precision);
    }
    toBeCloseTo(value, numDigits = 2) {
        const action = 'to be close to';
        return this.handleResult(new ExpectationResult_1.default(this._toBeCloseTo(value, numDigits), this.value, action, value));
    }
    _toBeCloseTo(value, numDigits = 2) {
        if (typeof this.value !== 'number' || typeof value !== 'number')
            throw new TypeError('value must be a number');
        return Math.abs(value - this.value) < Math.pow(10, -numDigits) / 2;
    }
    toBeDefined() {
        return this.handleResult(new ExpectationResult_1.default(this._toBeDefined(), this.value, 'to be defined'));
    }
    _toBeDefined() {
        return this.value !== undefined;
    }
    toBeUndefined() {
        return this.handleResult(new ExpectationResult_1.default(this._toBeUndefined(), this.value, 'to be undefined'));
    }
    _toBeUndefined() {
        return this.value === undefined;
    }
    toBeNull() {
        return this.handleResult(new ExpectationResult_1.default(this._toBeNull(), this.value, 'to be null'));
    }
    _toBeNull() {
        return this.value === null;
    }
    toBeTruthy() {
        return this.handleResult(new ExpectationResult_1.default(this._toBeTruthy(), this.value, 'to be truthy'));
    }
    _toBeTruthy() {
        return Boolean(this.value);
    }
    toBeNaN() {
        return this.handleResult(new ExpectationResult_1.default(this._toBeNaN(), this.value, 'to be NaN'));
    }
    _toBeNaN() {
        return isNaN(Number(this.value));
    }
    toBePromise() {
        return this.handleResult(new ExpectationResult_1.default(this._toBePromise(), this.value, 'to be a Promise'));
    }
    _toBePromise() {
        return this.value instanceof Promise;
    }
    toBeArray() {
        return this.handleResult(new ExpectationResult_1.default(this._toBeArray(), this.value, 'to be an Array'));
    }
    _toBeArray() {
        return Array.isArray(this.value);
    }
    toHaveProperty(keyPath, value, strict = false) {
        return this.handleResult(new ExpectationResult_1.default(this._toHaveProperty(keyPath, value, strict), this.value, `to have property ${keyPath} ${value ? 'and equal ' + (strict ? 'strict' : '"') + value + '"' : ''}`));
    }
    _toHaveProperty(keyPath, value, strict = false) {
        const props = keyPath.split('.');
        let cur = this.value;
        for (let prop of props) {
            cur = cur?.[prop];
            if (cur === undefined)
                return false;
        }
        if (!value)
            return true;
        if (!strict)
            return new Expectation(cur)._toEqual(value);
        else
            return new Expectation(cur)._toEqualStrict(value);
    }
    _toEqualGeneric(value, cmpFn, precision = 2) {
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
        }
        else {
            if (isFloat(this.value) && isFloat(value)) {
                return this._toBeCloseTo(value, precision);
            }
            return cmpFn.call(this, value);
        }
    }
    toResolve(value, strict = false) {
        if (!this._toBePromise())
            return this.toBePromise();
        const expectationResult = new ExpectationResult_1.default(this.value.then((resolveValue) => {
            if (!value)
                return true;
            const expectation = new Expectation(resolveValue);
            return strict
                ? expectation.toEqualStrict(value).result
                : expectation.toEqual(value).result;
        }, (rejectValue) => false), this.value, 'to resolve');
        return this.handleResult(expectationResult);
    }
    toReject(value, strict = false) {
        if (!this._toBePromise())
            return this.toBePromise();
        return this.handleResult(new ExpectationResult_1.default(this.value.then((resolveValue) => false, (rejectValue) => {
            if (!value)
                return true;
            const expectation = new Expectation(rejectValue);
            return strict
                ? expectation.toEqualStrict(value).result
                : expectation.toEqual(value).result;
        }), this.value, 'to reject'));
    }
}
exports.default = Expectation;
