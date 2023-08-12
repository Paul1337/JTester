const promisify = (value) => (value instanceof Promise ? value : Promise.resolve(value));

class ExpectationResult {
    constructor(state, received, expectAction, expected) {
        this.state = promisify(state);
        this.recieved = received;
        this.expected = expected;
        this.expectAction = expectAction;
        this.isInversed = false;
        this.description = null;

        this.chains = [];
        this.chainIndex = 0;
    }

    async solve() {
        if (this.state instanceof Promise) {
            return this.state.then((value) => {
                if (value instanceof ExpectationResult) {
                    return value.solve().then((result) => {
                        console.log('inner', result);
                        this.state = result;

                        this.recieved = value.recieved;
                        this.expected = value.expected;
                        this.expectAction = value.expectAction;
                        this.isInversed = value.isInversed;

                        return result;
                    });
                } else if (typeof value === 'boolean') {
                    this.state = value;
                    return value;
                } else {
                    throw new Error('State is resolved in unknown format');
                }
            });
        }
        return value;
    }

    chain(callback) {
        this.chains.push(callback);
    }

    get stateStr() {
        return this.state ? 'OK' : 'FAILED';
    }

    get recievedFormatted() {
        if (this.recieved == undefined) return JSON.stringify(this.recieved);
        return this.formatValue(this.recieved);
    }

    get expectedFormatted() {
        return this.formatValue(this.expected);
    }

    formatValue(value) {
        if (value == undefined) return '';
        if (value instanceof Promise) {
            return '<Promise>';
        }
        return JSON.stringify(value);
    }

    get resultTxt() {
        if (this.state) {
            return this.stateStr;
        } else {
            const inv = this.isInversed ? 'not ' : '';
            return `${this.stateStr} - Expected ${this.recievedFormatted} ${inv}${this.expectAction} ${this.expectedFormatted}`;
        }
    }

    described(description) {
        this.description = description;
        return this;
    }

    inversed() {
        const res = new ExpectationResult(!this.state, this.recieved, this.expectAction, this.expected);
        res.isInversed = !res.isInversed;
        return res;
    }
}

module.exports = ExpectationResult;
