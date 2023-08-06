const ExpectationResult = require('./ExpectationResult.js');

class Expectation {
    constructor(value) {
        this.value = value;
    }

    get not() {
        return new Proxy(this, {
            get(target, prop, receiver) {
                if (target[prop] instanceof Function) {
                    const res = target[prop];
                    return (value) => res.call(target, value).inversed();
                }
                return target[prop];
            },
        });
    }

    toContain(item) {
        return new ExpectationResult(this._toContain(item), this.value, 'to contain', item);
    }

    _toContain(item) {
        if ((typeof this.value === 'string' && typeof item === 'string') || Array.isArray(this.value))
            return this.value.includes(item);
        return false;
    }

    toBe(value) {
        return new ExpectationResult(this._toBe(value), this.value, 'to be', value);
    }

    _toBe(value) {
        return this.value == value;
    }

    toBeStrict(value) {
        return new ExpectationResult(this._toBeStrict(value), this.value, 'to be strict', value);
    }

    _toBeStrict(value) {
        if (this.value === 0 && value === 0) return true;
        return Object.is(this.value, value);
    }

    toEqual(value) {
        return new ExpectationResult(this._toEqual(value), this.value, 'to equal', value);
    }

    _toEqual(value) {
        return this._toEqualGeneric(value, this._toBe);
    }

    toEqualStrict(value) {
        return new ExpectationResult(this._toEqualStrict(value), this.value, 'to equal strict', value);
    }

    _toEqualStrict(value) {
        return this._toEqualGeneric(value, this._toBeStrict);
    }

    toBeCloseTo(value, numDigits = 2) {
        const action = 'to be close to';
        return new ExpectationResult(this._toBeCloseTo(value, numDigits), this.value, action, value);
    }

    _toBeCloseTo(value, numDigits = 2) {
        if (typeof this.value !== 'number' || typeof value !== 'number')
            throw new TypeError('value must be a number');
        return Math.abs(value - this.value) < Math.pow(10, -numDigits) / 2;
    }

    toBeDefined() {
        return new ExpectationResult(this._toBeDefined(), this.value, 'to be defined');
    }

    _toBeDefined() {
        return this.value !== undefined;
    }

    toBeUndefined() {
        return new ExpectationResult(this._toBeUndefined(), this.value, 'to be undefined');
    }

    _toBeUndefined() {
        return this.value === undefined;
    }

    toBeNull() {
        return new ExpectationResult(this._toBeNull(), this.value, 'to be null');
    }

    _toBeNull() {
        return this.value === null;
    }

    toBeTruthy() {
        return new ExpectationResult(this._toBeTruthy(), this.value, 'to be truthy');
    }

    _toBeTruthy() {
        return Boolean(this.value);
    }

    toBeNaN() {
        return new ExpectationResult(this._toBeNaN(), this.value, 'to be NaN');
    }

    _toBeNaN() {
        return isNaN(this.value);
    }

    toHaveProperty(keyPath, value, strict = false) {
        return new ExpectationResult(
            this._toHaveProperty(keyPath, value, strict),
            this.value,
            `to have property ${keyPath} ${
                value ? 'and equal ' + (strict ? 'strict' : '"') + value + '"' : ''
            }`
        );
    }

    _toHaveProperty(keyPath, value, strict = false) {
        const props = keyPath.split('.');
        let cur = this.value;
        for (let prop of props) {
            cur = cur?.[prop];
            if (!cur) return false;
        }
        if (!value) return true;
        if (!strict) return new Expectation(cur)._toEqual(value);
        else return new Expectation(cur)._toEqualStrict(value);
    }

    _toEqualGeneric(value, cmpFn) {
        if (this.value == undefined || value == undefined) {
            return cmpFn.call(this, value);
        }
        if (typeof this.value === 'object' && typeof value === 'object') {
            for (let property in this.value) {
                const propVal = this.value[property];
                const compVal = value[property];

                const expectObj = new Expectation(propVal);
                if (!expectObj._toEqualGeneric(compVal, cmpFn)) {
                    return false;
                }
            }
            return true;
        } else {
            return cmpFn.call(this, value);
        }
    }

    toResolve(value, strict = false) {
        if (!(this.value instanceof Promise)) {
            throw new TypeError('Expectation value should be promise to check for resolving!');
        }
        return this.value
            .then((resolveValue) => {
                if (!value) return new ExpectationResult(true, this.value, 'to resolve');
                const expectation = new Expectation(resolveValue);
                return strict ? expectation.toEqualStrict(value) : expectation.toEqual(value);
            })
            .catch(() => {
                return new ExpectationResult(false, this.value, 'to resolve');
            });
    }

    toReject(value, strict = false) {
        if (!(this.value instanceof Promise)) {
            throw new TypeError('Expectation value should be promise to check for rejecting!');
        }
        return this.value
            .then(() => {
                return new ExpectationResult(false, this.value, 'to reject');
            })
            .catch((rejectValue) => {
                if (!value) return new ExpectationResult(true, this.value, 'to reject');
                const expectation = new Expectation(rejectValue);
                return strict ? expectation.toEqualStrict(value) : expectation.toEqual(value);
            });
    }
}

module.exports = Expectation;
