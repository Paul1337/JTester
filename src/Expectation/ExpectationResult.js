class ExpectationResult {
    constructor(state, received, expectAction, expected) {
        this.state = state;
        this.recieved = received;
        this.expected = expected;
        this.expectAction = expectAction;
        this.isInversed = false;
    }

    get stateStr() {
        return this.state ? 'OK' : 'FAILED';
    }

    get recievedFormatted() {
        return this.formatValue(this.recieved);
    }

    get expectedFormatted() {
        return this.formatValue(this.expected);
    }

    formatValue(value) {
        if (!value) return '';
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return value;
    }

    get resultTxt() {
        if (this.state) {
            return this.stateStr;
        } else {
            const inv = this.isInversed ? 'not ' : '';
            return `${this.stateStr} - Expected ${this.recievedFormatted} ${inv}${this.expectAction} ${this.expectedFormatted}`;
        }
    }

    inversed() {
        const res = new ExpectationResult(!this.state, this.recieved, this.expectAction, this.expected);
        res.isInversed = !res.isInversed;
        return res;
    }
}

module.exports = ExpectationResult;
