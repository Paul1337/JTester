class ExpectationResult {
    constructor(state, received, expectAction, expected) {
        this.state = state;
        this.recieved = received;
        this.expected = expected;
        this.expectAction = expectAction;
        this.isInversed = false;
        this.description = '';
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
